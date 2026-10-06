const { findMatches } = require("../services/matchingService");

const matchOrgans = async (req, res) => {
  try {
    const {
      organType,
      bloodGroup,
      urgency,
      location,
    } = req.body;

    if (
      !organType ||
      !bloodGroup ||
      !urgency ||
      !location
    ) {
      return res.status(400).json({
        message:
          "organType, bloodGroup, urgency and location are required",
      });
    }

    if (
      location.lat == null ||
      location.lng == null
    ) {
      return res.status(400).json({
        message:
          "Location coordinates are required",
      });
    }

    const matches = await findMatches({
      organType,
      bloodGroup,
      urgency,
      location,
    });

    res.status(200).json({
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error("Matching Error:", error);

    res.status(500).json({
      message: "Server error while finding matches",
    });
  }
};

module.exports = {
  matchOrgans,
};