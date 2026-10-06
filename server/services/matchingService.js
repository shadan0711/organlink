const Organ = require("../models/Organ");

const urgencyScore = {
  critical: 15,
  high: 12,
  medium: 8,
  low: 4,
};

// Prototype ABO compatibility rules.
// These are used only as a simplified project criterion.
const bloodCompatibility = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": [
    "O-",
    "O+",
    "A-",
    "A+",
    "B-",
    "B+",
    "AB-",
    "AB+",
  ],
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  if (
    lat1 == null ||
    lng1 == null ||
    lat2 == null ||
    lng2 == null
  ) {
    return null;
  }

  const earthRadius = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

const calculateLocationScore = (distance) => {
  if (distance === null) return 0;

  if (distance <= 10) return 10;
  if (distance <= 25) return 8;
  if (distance <= 50) return 5;
  if (distance <= 100) return 3;

  return 1;
};

const calculateExpiryScore = (expiresAt) => {
  const remainingHours =
    (new Date(expiresAt) - new Date()) / (1000 * 60 * 60);

  if (remainingHours <= 2) return 5;
  if (remainingHours <= 6) return 4;
  if (remainingHours <= 12) return 3;
  if (remainingHours <= 24) return 2;

  return 1;
};

const calculateMatch = (organ, request) => {
  const patientBloodGroup = request.bloodGroup;

  const compatibleGroups =
    bloodCompatibility[patientBloodGroup] || [];

  const bloodMatch = compatibleGroups.includes(
    organ.bloodGroup
  );

  if (!bloodMatch) {
    return null;
  }

  const distance = calculateDistance(
    request.location?.lat,
    request.location?.lng,
    organ.location?.coordinates?.lat,
    organ.location?.coordinates?.lng
  );

  const scores = {
    organType: 40,
    bloodGroup: 30,
    urgency: urgencyScore[request.urgency] || 0,
    location: calculateLocationScore(distance),
    expiry: calculateExpiryScore(organ.expiresAt),
  };

  const totalScore =
    scores.organType +
    scores.bloodGroup +
    scores.urgency +
    scores.location +
    scores.expiry;

  return {
    organ,
    score: totalScore,
    scoreBreakdown: scores,
    distanceKm:
      distance !== null
        ? Number(distance.toFixed(2))
        : null,
  };
};

const findMatches = async (request) => {
  const organs = await Organ.find({
    organType: request.organType,
    status: "available",
    expiresAt: { $gt: new Date() },
  }).populate(
    "provider",
    "name type city state"
  );

  const matches = organs
    .map((organ) => calculateMatch(organ, request))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  return matches;
};

module.exports = {
  findMatches,
};