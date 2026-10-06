const Organ = require("../models/Organ");

const updateExpiredOrgans = async () => {
  await Organ.updateMany(
    {
      status: "available",
      expiresAt: { $lte: new Date() },
    },
    {
      $set: {
        status: "expired",
      },
    }
  );
};

module.exports = updateExpiredOrgans;