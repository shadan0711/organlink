const express = require("express");

const {
  updateTransferStatus,
  getMyTransfers,
} = require("../controllers/transferController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/my",
  protect,
  authorize("organBank", "hospital"),
  getMyTransfers
);

router.patch(
  "/:transferId/status",
  protect,
  authorize("organBank", "hospital"),
  updateTransferStatus
);


module.exports = router;