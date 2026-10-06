const express = require("express");

const {
  createRequest,
  getReceivedRequests,
   updateRequestStatus,
} = require("../controllers/requestController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("hospital"),
  createRequest
);

router.get(
  "/received",
  protect,
  authorize("organBank"),
  getReceivedRequests
);

router.patch(
  "/:requestId/status",
  protect,
  authorize("organBank"),
  updateRequestStatus
);

module.exports = router;