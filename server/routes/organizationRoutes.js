const express = require("express");

const {
    getAllOrganizations,
    getOrganizationById,
    updateOrganizationStatus,
} = require("../controllers/organizationController");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    authorize("admin"),
    getAllOrganizations
);

router.get(
    "/:organizationId",
    protect,
    authorize("admin"),
    getOrganizationById
);

router.patch(
    "/:organizationId/status",
    protect,
    authorize("admin"),
    updateOrganizationStatus
);

module.exports = router;