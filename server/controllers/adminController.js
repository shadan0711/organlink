const User = require("../models/User");
const Organization = require("../models/Organization");
const Organ = require("../models/Organ");
const Request = require("../models/Request");
const Transfer = require("../models/Transfer");
const AuditLog = require("../models/AuditLog");

const getAdminDashboard = async (req, res) => {
  try {
    // Update expired organs before calculating statistics
    await Organ.updateMany(
      {
        status: "available",
        expiresAt: { $lte: new Date() },
      },
      {
        $set: { status: "expired" },
      }
    );

    const [
      totalUsers,
      totalHospitals,
      totalOrganBanks,
      totalOrgans,
      totalRequests,
      totalTransfers,
      availableOrgans,
      expiredOrgans,
      pendingRequests,
      completedRequests,
      activeTransfers,
      completedTransfers,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments(),

      Organization.countDocuments({
        type: "hospital",
      }),

      Organization.countDocuments({
        type: "organBank",
      }),

      Organ.countDocuments(),

      Request.countDocuments(),

      Transfer.countDocuments(),

      Organ.countDocuments({
        status: "available",
      }),

      Organ.countDocuments({
        status: "expired",
      }),

      Request.countDocuments({
        status: "pending",
      }),

      Request.countDocuments({
        status: "completed",
      }),

      Transfer.countDocuments({
        status: {
          $in: ["initiated", "in_transit"],
        },
      }),

      Transfer.countDocuments({
        status: "delivered",
      }),

      AuditLog.find()
        .populate("performedBy", "name email role")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.status(200).json({
      role: "admin",

      stats: {
        totalUsers,
        totalHospitals,
        totalOrganBanks,
        totalOrgans,
        totalRequests,
        totalTransfers,

        availableOrgans,
        expiredOrgans,

        pendingRequests,
        completedRequests,

        activeTransfers,
        completedTransfers,
      },

      recentActivity,
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);

    res.status(500).json({
      message: "Server error while loading admin dashboard",
    });
  }
};

module.exports = {
  getAdminDashboard,
};