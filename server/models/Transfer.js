const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
      unique: true,
    },

    organ: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organ",
      required: true,
    },

    fromOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    toOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "initiated",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      default: "initiated",
    },

    pickupLocation: {
      address: String,
      city: String,
      state: String,
      pincode: String,
    },

    destinationLocation: {
      address: String,
      city: String,
      state: String,
      pincode: String,
    },

    estimatedArrival: {
      type: Date,
    },

    startedAt: {
      type: Date,
    },

    deliveredAt: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transfer", transferSchema);