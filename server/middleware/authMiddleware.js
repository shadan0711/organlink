const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Organization = require("../models/Organization");

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const parts = authHeader.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                message: "Invalid authorization format",
            });
        }

        const token = parts[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Admin does not belong to an organization
        if (decoded.role === "admin") {
            req.user = decoded;
            return next();
        }

        const user = await User.findById(decoded.userId).select(
            "isActive organization role"
        );

        if (!user) {
            return res.status(401).json({
                message: "User account not found",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "Your account has been deactivated",
            });
        }

        // Check current organization status
        if (user.organization) {
            const organization = await Organization.findById(
                user.organization
            ).select("isActive");

            if (!organization) {
                return res.status(403).json({
                    message: "Your organization no longer exists",
                });
            }

            if (!organization.isActive) {
                return res.status(403).json({
                    message: "Your organization has been deactivated",
                });
            }
        }

        req.user = decoded;

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);

        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You are not authorized to perform this action",
            });
        }

        next();
    };
};

module.exports = {
    protect,
    authorize,
};