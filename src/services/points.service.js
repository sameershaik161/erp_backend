import User from "../models/User.js";

/**
 * Calculate points for an achievement based on type, level, and award
 * @param {String} achievementType - 'Competition' or 'Certification'
 * @param {String} level - 'National', 'State', 'District', 'College', 'Department'
 * @param {String} award - '1', '2', '3', 'runner', 'participation' (for competitions only)
 * @returns {Number} calculated points
 */
export function calculateAchievementPoints(achievementType, level, award = null) {
  // Base points for different levels
  const levelPoints = {
    'International': 150,
    'National': 100,
    'State': 80,
    'District': 60,
    'College': 40,
    'Department': 20
  };

  // Award multipliers for competitions
  const awardMultipliers = {
    '1': 2.0,      // 1st Place - 200%
    '2': 1.5,      // 2nd Place - 150%
    '3': 1.2,      // 3rd Place - 120%
    'runner': 1.1, // Runner Up - 110%
    'participation': 0.5 // Participation - 50%
  };

  const basePoints = levelPoints[level] || 10; // Default 10 points for unknown levels

  if (achievementType === 'Competition' && award) {
    const multiplier = awardMultipliers[award] || 0.5;
    return Math.round(basePoints * multiplier);
  } else if (achievementType === 'Certification') {
    // For certifications, no award multiplier, just base points
    return basePoints;
  }

  // Default case
  return basePoints;
}

/**
 * Add points to a user (atomic)
 * @param {String} userId
 * @param {Number} points
 */
export async function addPoints(userId, points) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  user.totalPoints = (user.totalPoints || 0) + Number(points || 0);
  await user.save();
  return user.totalPoints;
}

/**
 * Adjust points by delta (can be negative)
 */
export async function adjustPoints(userId, delta) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  user.totalPoints = (user.totalPoints || 0) + Number(delta || 0);
  if (user.totalPoints < 0) user.totalPoints = 0;
  await user.save();
  return user.totalPoints;
}
