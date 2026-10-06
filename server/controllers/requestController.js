const Organ = require("../models/Organ");
const Request = require("../models/Request");
const { findMatches } = require("../services/matchingService");
const Transfer = require("../models/Transfer");
const AuditLog = require("../models/AuditLog");

const createRequest = async (req, res) => {
  try {
    const {
      organId,
      patientReference,
      patientBloodGroup,
      urgency,
      message,
      location,
    } = req.body;

    // 1. Validate required fields
    if (
      !organId ||
      !patientReference ||
      !patientBloodGroup ||
      !urgency ||
      !location
    ) {
      return res.status(400).json({
        message:
          "organId, patientReference, patientBloodGroup, urgency and location are required",
      });
    }

    // 2. Find the organ
    const organ = await Organ.findById(organId);

    if (!organ) {
      return res.status(404).json({
        message: "Organ not found",
      });
    }

    // 3. Check organ status
    if (organ.status !== "available") {
      return res.status(400).json({
        message: `Organ is currently ${organ.status}`,
      });
    }

    // 4. Check expiry
    if (new Date(organ.expiresAt) <= new Date()) {
      organ.status = "expired";
      await organ.save();

      return res.status(400).json({
        message: "This organ has expired",
      });
    }

    // 5. Make sure this hospital isn't already requesting it
    const existingRequest = await Request.findOne({
      organ: organId,
      requestingOrganization: req.user.organizationId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(409).json({
        message: "You already have a pending request for this organ",
      });
    }

    // 6. Calculate the match score again
    const matches = await findMatches({
      organType: organ.organType,
      bloodGroup: patientBloodGroup,
      urgency,
      location,
    });

    const selectedMatch = matches.find(
      (match) =>
        match.organ._id.toString() === organId
    );

    if (!selectedMatch) {
      return res.status(400).json({
        message:
          "This organ does not satisfy the matching criteria",
      });
    }

    // 7. Create request
    const newRequest = await Request.create({
      organ: organId,

      requestingOrganization:
        req.user.organizationId,

      requestedBy: req.user.userId,

      patientReference,

      patientBloodGroup,

      urgency,

      message,

      priorityScore: selectedMatch.score,

      priorityDetails:
        selectedMatch.scoreBreakdown,
    });

    // 8. Return response
    res.status(201).json({
      message: "Organ request submitted successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error("Create Request Error:", error);

    res.status(500).json({
      message: "Server error while creating request",
    });
  }
};

const updateRequestStatus = async (req, res) => {
  const { status } = req.body;
  const { requestId } = req.params;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      message:
        "Status must be either approved or rejected",
    });
  }

  const session = await Request.startSession();

  try {
    session.startTransaction();

    const request = await Request.findById(
      requestId
    )
      .populate("organ")
      .session(session);

    if (!request) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Request not found",
      });
    }

    // Make sure this request belongs to
    // an organ provided by this organ bank.
    if (
      request.organ.provider.toString() !==
      req.user.organizationId.toString()
    ) {
      await session.abortTransaction();

      return res.status(403).json({
        message:
          "You are not authorized to manage this request",
      });
    }

    if (request.status !== "pending") {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          `Request is already ${request.status}`,
      });
    }

    // -----------------------------
    // REJECT
    // -----------------------------

    if (status === "rejected") {
      request.status = "rejected";

      await request.save({ session });

      await session.commitTransaction();

      return res.status(200).json({
        message: "Request rejected successfully",
        request,
      });
    }

    // -----------------------------
    // APPROVE
    // -----------------------------

    // Atomically reserve the organ.
    //
    // If another hospital already reserved it,
    // this update will match ZERO documents.

    const reservedOrgan =
      await Organ.findOneAndUpdate(
        {
          _id: request.organ._id,
          status: "available",
          expiresAt: { $gt: new Date() },
        },
        {
          $set: {
            status: "reserved",
          },
        },
        {
          new: true,
          session,
        }
      );

    if (!reservedOrgan) {
      await session.abortTransaction();

      return res.status(409).json({
        message:
          "This organ is no longer available",
      });
    }

    request.status = "approved";

await request.save({ session });

const transfer = await Transfer.create(
  [
    {
      request: request._id,

      organ: request.organ._id,

      fromOrganization:
        request.organ.provider,

      toOrganization:
        request.requestingOrganization,

      status: "initiated",

      pickupLocation:
        request.organ.location,

      destinationLocation: {
        // We'll improve this using the hospital
        // organization's address later.
        city: "Pending",
      },

      startedAt: new Date(),

      notes:
        "Transfer initiated after request approval.",
    },
  ],
  { session }
);

await AuditLog.create(
  [
    {
      action: "REQUEST_APPROVED",

      entityType: "request",

      entityId: request._id,

      performedBy: req.user.userId,

      organization:
        req.user.organizationId,

      details: {
        organId: request.organ._id,
        transferId: transfer[0]._id,
      },
    },
  ],
  { session }
);

await session.commitTransaction();

return res.status(200).json({
  message: "Request approved successfully",

  request,

  organ: reservedOrgan,

  transfer: transfer[0],
});

  } catch (error) {
    await session.abortTransaction();

    console.error(
      "Update Request Status Error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating request",
    });
  } finally {
    await session.endSession();
  }
};

const getReceivedRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      status: "pending",
    })
      .populate({
        path: "organ",
        match: {
          provider: req.user.organizationId,
        },
        select:
          "organType bloodGroup location expiresAt status",
      })
      .populate(
        "requestingOrganization",
        "name city state"
      )
      .populate(
        "requestedBy",
        "name email"
      )
      .sort({
        priorityScore: -1,
        createdAt: 1,
      });

    // Remove requests whose organ does not belong
    // to this organ bank.
    const filteredRequests = requests.filter(
      (request) => request.organ !== null
    );

    res.status(200).json({
      count: filteredRequests.length,
      requests: filteredRequests,
    });

  } catch (error) {
    console.error(
      "Get Received Requests Error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching received requests",
    });
  }
};

module.exports = {
  createRequest,
  getReceivedRequests,
  updateRequestStatus,
};