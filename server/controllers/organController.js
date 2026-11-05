const Organ = require("../models/Organ");
const updateExpiredOrgans = require("../utils/updateExpiredOrgans");

const createOrgan = async (req, res) => {
  try {
    const {
      organType,
      bloodGroup,
      location,
      expiresAt,
      description,
    } = req.body;

    // Validate required fields
    if (
      !organType ||
      !bloodGroup ||
      !location ||
      !expiresAt
    ) {
      return res.status(400).json({
        message: "Please provide all required organ details",
      });
    }

    // Check expiry date
    const expiryDate = new Date(expiresAt);

    if (isNaN(expiryDate.getTime())) {
      return res.status(400).json({
        message: "Invalid expiry date",
      });
    }

    if (expiryDate <= new Date()) {
      return res.status(400).json({
        message: "Expiry date must be in the future",
      });
    }

    const organ = await Organ.create({
      organType,
      bloodGroup,

      provider: req.user.organizationId,

      location,

      expiresAt: expiryDate,

      description,

      createdBy: req.user.userId,
    });

    res.status(201).json({
      message: "Organ added successfully",
      organ,
    });

  } catch (error) {
    console.error("Create Organ Error:", error);

    res.status(500).json({
      message: "Server error while adding organ",
    });
  }
};

const getOrgans = async (req, res) => {
  try {
    await updateExpiredOrgans();
    const {
      organType,
      bloodGroup,
      city,
      status,
    } = req.query;

    const filter = {};

    // Organ banks can view all organs by default.
// Hospitals can view only available organs by default.
if (status) {
  filter.status = status;
} else if (req.user.role === "hospital") {
  filter.status = "available";
}

    if (organType) {
      filter.organType = organType;
    }

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    if (city) {
      filter["location.city"] = {
        $regex: city,
        $options: "i",
      };
    }

    const organs = await Organ.find(filter)
      .populate("provider", "name type city state")
      .sort({ expiresAt: 1 });

    res.status(200).json({
      count: organs.length,
      organs,
    });

  } catch (error) {
    console.error("Get Organs Error:", error);

    res.status(500).json({
      message: "Server error while fetching organs",
    });
  }
};

const getOrganById = async (req, res) => {
  try {
    await updateExpiredOrgans();

    const organ = await Organ.findById(req.params.id)
      .populate("provider", "name type city state phone")
      .populate("createdBy", "name email");

    if (!organ) {
      return res.status(404).json({
        message: "Organ not found",
      });
    }

    res.status(200).json({
      organ,
    });

  } catch (error) {
    console.error("Get Organ Error:", error);

    res.status(500).json({
      message: "Server error while fetching organ",
    });
  }
};

module.exports = {
  createOrgan,
  getOrgans,
  getOrganById
};