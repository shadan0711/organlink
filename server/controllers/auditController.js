const AuditLog = require("../models/AuditLog");

const getAuditLogs = async (req, res) => {
  try {
    const { entityType, action, limit = 50 } = req.query;

    const filter = {};

    if (entityType) {
      filter.entityType = entityType;
    }

    if (action) {
      filter.action = action;
    }

    const logs = await AuditLog.find(filter)
      .populate("performedBy", "name email role")
      .populate("organization", "name type")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Get Audit Logs Error:", error);

    res.status(500).json({
      message: "Server error while fetching audit logs",
    });
  }
};

module.exports = {
  getAuditLogs,
};