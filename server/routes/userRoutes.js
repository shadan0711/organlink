const express = require("express");

const {
  getAllUsers,
  getUserById,
  updateUserStatus,

} = require("../controllers/userController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Existing authentication test route
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

// Admin: get all users
router.get(
  "/",
  protect,
  authorize("admin"),
  getAllUsers
);


// Admin: get single user
router.get(
  "/:userId",
  protect,
  authorize("admin"),
  getUserById
);

// Admin: activate/deactivate user
router.patch(
  "/:userId/status",
  protect,
  authorize("admin"),
  updateUserStatus
);

module.exports = router;