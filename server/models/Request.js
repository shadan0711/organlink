const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    organ: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organ",
      required: true,
    },

    requestingOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    patientReference: {
      type: String,
      required: true,
      trim: true,
    },

    patientBloodGroup: {
      type: String,
      enum: [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
      ],
      required: true,
    },

    urgency: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    priorityScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    priorityDetails: {
      organType: {
        type: Number,
        default: 0,
      },

      bloodGroup: {
        type: Number,
        default: 0,
      },

      urgency: {
        type: Number,
        default: 0,
      },

      location: {
        type: Number,
        default: 0,
      },

      expiry: {
        type: Number,
        default: 0,
      },
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "expired",
        "completed",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Request", requestSchema);