const express = require("express");

const {
  matchOrgans,
} = require("../controllers/matchingController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("hospital"),
  matchOrgans
);

module.exports = router;