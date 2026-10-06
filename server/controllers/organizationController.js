const Organization = require("../models/Organization");

const getAllOrganizations = async (req, res) => {
  try {
    const { type, isVerified, isActive } = req.query;

    const filter = {};

    if (type) {
      filter.type = type;
    }

    if (isVerified !== undefined) {
      filter.isVerified = isVerified === "true";
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const organizations = await Organization.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: organizations.length,
      organizations,
    });
  } catch (error) {
    console.error("Get Organizations Error:", error);

    res.status(500).json({
      message: "Server error while fetching organizations",
    });
  }
};

const getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findById(
      req.params.organizationId
    );

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    res.status(200).json({
      organization,
    });
  } catch (error) {
    console.error("Get Organization Error:", error);

    res.status(500).json({
      message: "Server error while fetching organization",
    });
  }
};

const updateOrganizationStatus = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { isVerified, isActive } = req.body;

    if (
      typeof isVerified !== "boolean" &&
      typeof isActive !== "boolean"
    ) {
      return res.status(400).json({
        message: "Provide isVerified or isActive as a boolean",
      });
    }

    const organization = await Organization.findById(
      organizationId
    );

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    const changes = {};

    if (typeof isVerified === "boolean") {
      organization.isVerified = isVerified;
      changes.isVerified = isVerified;
    }

    if (typeof isActive === "boolean") {
      organization.isActive = isActive;
      changes.isActive = isActive;
    }

    await organization.save();

    const AuditLog = require("../models/AuditLog");

    await AuditLog.create({
      action: "ORGANIZATION_STATUS_UPDATED",
      entityType: "organization",
      entityId: organization._id,
      performedBy: req.user.userId,
      details: {
        changes,
        organizationName: organization.name,
      },
    });

    res.status(200).json({
      message: "Organization status updated successfully",
      organization,
    });
  } catch (error) {
    console.error("Update Organization Status Error:", error);

    res.status(500).json({
      message: "Server error while updating organization",
    });
  }
};

module.exports = {
  getAllOrganizations,
  getOrganizationById,
  updateOrganizationStatus,
};