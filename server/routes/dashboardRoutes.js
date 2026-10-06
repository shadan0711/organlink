const express = require("express");

const {
  getHospitalDashboard,
  getOrganBankDashboard,
   getAdminDashboard,
} = require("../controllers/dashboardController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/hospital",
  protect,
  authorize("hospital"),
  getHospitalDashboard
);

router.get(
  "/organ-bank",
  protect,
  authorize("organBank"),
  getOrganBankDashboard
);

router.get(
  "/admin",
  protect,
  authorize("admin"),
  getAdminDashboard
);

module.exports = router;