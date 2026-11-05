const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { role, isActive } = req.query;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const users = await User.find(filter)
      .select("-password")
      .populate(
        "organization",
        "name type city state isActive isVerified"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);

    res.status(500).json({
      message: "Server error while fetching users",
    });
  }
};

// Get single user
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password")
      .populate(
        "organization",
        "name type registrationNumber city state isActive isVerified"
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get User Error:", error);

    res.status(500).json({
      message: "Server error while fetching user",
    });
  }
};

// Activate / deactivate user
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be a boolean",
      });
    }

    // Prevent admin from deactivating their own account
    if (req.user.userId === userId) {
      return res.status(400).json({
        message: "You cannot deactivate your own account",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isActive = isActive;

    await user.save();

    await AuditLog.create({
      action: "USER_STATUS_UPDATED",
      entityType: "user",
      entityId: user._id,
      performedBy: req.user.userId,
      organization: user.organization || undefined,
      details: {
        isActive,
        userName: user.name,
        userEmail: user.email,
      },
    });

    const updatedUser = await User.findById(user._id)
      .select("-password")
      .populate(
        "organization",
        "name type city state isActive isVerified"
      );

    res.status(200).json({
      message: "User status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update User Status Error:", error);

    res.status(500).json({
      message: "Server error while updating user status",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,

};