const Organ = require("../models/Organ");
const Request = require("../models/Request");
const Transfer = require("../models/Transfer");
const User = require("../models/User");
const Organization = require("../models/Organization");
const AuditLog = require("../models/AuditLog");

const getHospitalDashboard = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        // Requests made by this hospital
        const requests = await Request.find({
            requestingOrganization: organizationId,
        });

        const requestIds = requests.map((request) => request._id);

        // Transfers related to this hospital's requests
        const transfers = await Transfer.find({
            request: { $in: requestIds },
        });

        const stats = {
            totalRequests: requests.length,

            pendingRequests: requests.filter(
                (request) => request.status === "pending"
            ).length,

            approvedRequests: requests.filter(
                (request) => request.status === "approved"
            ).length,

            completedRequests: requests.filter(
                (request) => request.status === "completed"
            ).length,

            activeTransfers: transfers.filter(
                (transfer) =>
                    transfer.status === "initiated" ||
                    transfer.status === "in_transit"
            ).length,

            completedTransfers: transfers.filter(
                (transfer) => transfer.status === "delivered"
            ).length,
        };

        res.status(200).json({
            role: "hospital",
            stats,
        });
    } catch (error) {
        console.error("Hospital Dashboard Error:", error);

        res.status(500).json({
            message: "Server error while loading hospital dashboard",
        });
    }
};


const getOrganBankDashboard = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        // Organs belonging to this organ bank
        const organs = await Organ.find({
            provider: organizationId,
        });

        // Requests for this organ bank's organs
        const organIds = organs.map((organ) => organ._id);

        const requests = await Request.find({
            organ: { $in: organIds },
        });

        // Transfers involving this organ bank
        const transfers = await Transfer.find({
            fromOrganization: organizationId,
        });

        const stats = {
            totalOrgans: organs.length,

            availableOrgans: organs.filter(
                (organ) => organ.status === "available"
            ).length,

            reservedOrgans: organs.filter(
                (organ) => organ.status === "reserved"
            ).length,

            transferredOrgans: organs.filter(
                (organ) => organ.status === "transferred"
            ).length,

            expiredOrgans: organs.filter(
                (organ) => organ.status === "expired"
            ).length,

            pendingRequests: requests.filter(
                (request) => request.status === "pending"
            ).length,

            approvedRequests: requests.filter(
                (request) => request.status === "approved"
            ).length,

            activeTransfers: transfers.filter(
                (transfer) =>
                    transfer.status === "initiated" ||
                    transfer.status === "in_transit"
            ).length,

            completedTransfers: transfers.filter(
                (transfer) => transfer.status === "delivered"
            ).length,
        };

        res.status(200).json({
            role: "organBank",
            stats,
        });
    } catch (error) {
        console.error("Organ Bank Dashboard Error:", error);

        res.status(500).json({
            message: "Server error while loading organ bank dashboard",
        });
    }
};

const getAdminDashboard = async (req, res) => {
    try {
        const [
            totalUsers,
            totalHospitals,
            totalOrganBanks,
            totalOrgans,
            totalRequests,
            totalTransfers,

            availableOrgans,
            reservedOrgans,
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
                status: "reserved",
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
                .populate("organization", "name type")
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
                reservedOrgans,
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
    getHospitalDashboard,
    getOrganBankDashboard,
    getAdminDashboard,
};