const express = require("express");

const {
  createOrgan,
  getOrgans,
  getOrganById,
  updateOrgan,
  cancelOrgan,
} = require("../controllers/organController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("hospital", "organBank"),
  getOrgans
);

router.get(
  "/:id",
  protect,
  authorize("hospital", "organBank"),
  getOrganById
);

router.post(
  "/",
  protect,
  authorize("organBank"),
  createOrgan
);

router.patch(
  "/:id",
  protect,
  authorize("organBank"),
  updateOrgan
);
router.patch(
  "/:id/cancel",
  protect,
  authorize("organBank"),
  cancelOrgan
);

module.exports = router;