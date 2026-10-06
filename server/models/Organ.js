const mongoose = require("mongoose");

const organSchema = new mongoose.Schema(
  {
    organType: {
      type: String,
      enum: [
        "kidney",
        "liver",
        "heart",
        "lung",
        "pancreas",
        "cornea",
      ],
      required: true,
    },

    bloodGroup: {
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

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    location: {
      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },

      coordinates: {
        lat: {
          type: Number,
        },

        lng: {
          type: Number,
        },
      },
    },

    availableFrom: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "available",
        "reserved",
        "transferred",
        "expired",
        "cancelled",
      ],
      default: "available",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Organ", organSchema);