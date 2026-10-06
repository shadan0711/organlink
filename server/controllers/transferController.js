const Transfer = require("../models/Transfer");
const Request = require("../models/Request");
const Organ = require("../models/Organ");
const AuditLog = require("../models/AuditLog");

const updateTransferStatus = async (req, res) => {
  const { transferId } = req.params;
  const { status, notes } = req.body;

  const allowedStatuses = [
    "in_transit",
    "delivered",
    "cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid transfer status",
    });
  }

  try {
    const transfer = await Transfer.findById(
      transferId
    );

    if (!transfer) {
      return res.status(404).json({
        message: "Transfer not found",
      });
    }

    // Get related request
    const request = await Request.findById(
      transfer.request
    );

    if (!request) {
      return res.status(404).json({
        message: "Related request not found",
      });
    }

    // Only the involved organizations can update
    // the transfer.
    const userOrganization =
      req.user.organizationId.toString();

    const isFromOrganization =
      transfer.fromOrganization.toString() ===
      userOrganization;

    const isToOrganization =
      transfer.toOrganization.toString() ===
      userOrganization;

    if (!isFromOrganization && !isToOrganization) {
      return res.status(403).json({
        message:
          "You are not authorized to update this transfer",
      });
    }

    // Validate state transitions
    if (
      status === "in_transit" &&
      transfer.status !== "initiated"
    ) {
      return res.status(400).json({
        message:
          "Only an initiated transfer can become in transit",
      });
    }

    if (
      status === "delivered" &&
      transfer.status !== "in_transit"
    ) {
      return res.status(400).json({
        message:
          "Only an in-transit transfer can be delivered",
      });
    }

    if (status === "cancelled") {
      if (
        !["initiated", "in_transit"].includes(
          transfer.status
        )
      ) {
        return res.status(400).json({
          message:
            "This transfer can no longer be cancelled",
        });
      }
    }

    transfer.status = status;

    if (notes) {
      transfer.notes = notes;
    }

    if (status === "in_transit") {
      transfer.startedAt = new Date();
    }

    if (status === "delivered") {
      transfer.deliveredAt = new Date();

      // Delivery completes the allocation.
      await Organ.findByIdAndUpdate(
        transfer.organ,
        {
          $set: {
            status: "transferred",
          },
        }
      );

      request.status = "completed";
      await request.save();
    }

    if (status === "cancelled") {
      // Since the organ wasn't delivered,
      // it can become available again if
      // it hasn't expired.
      await Organ.findOneAndUpdate(
        {
          _id: transfer.organ,
          status: "reserved",
          expiresAt: { $gt: new Date() },
        },
        {
          $set: {
            status: "available",
          },
        }
      );

      request.status = "cancelled";
      await request.save();
    }

    await transfer.save();

    await AuditLog.create({
      action: `TRANSFER_${status.toUpperCase()}`,

      entityType: "transfer",

      entityId: transfer._id,

      performedBy: req.user.userId,

      organization: req.user.organizationId,

      details: {
        requestId: request._id,
        organId: transfer.organ,
      },
    });

    res.status(200).json({
      message: `Transfer marked as ${status}`,
      transfer,
    });
  } catch (error) {
    console.error(
      "Update Transfer Error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating transfer",
    });
  }
};
const getMyTransfers = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const transfers = await Transfer.find({
      $or: [
        { fromOrganization: organizationId },
        { toOrganization: organizationId },
      ],
    })
      .populate(
        "organ",
        "organType bloodGroup location expiresAt status"
      )
      .populate(
        "fromOrganization",
        "name city state"
      )
      .populate(
        "toOrganization",
        "name city state"
      )
      .populate(
        "request",
        "patientReference urgency status priorityScore"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      count: transfers.length,
      transfers,
    });
  } catch (error) {
    console.error(
      "Get My Transfers Error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching transfers",
    });
  }
};

module.exports = {
  updateTransferStatus,
   getMyTransfers,
};