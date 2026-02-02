import Achievement from "../models/Achievement.js";
import User from "../models/User.js";

export async function getRecentActivities(req, res) {
  try {
    const userId = req.userId;
    
    // Get recent achievements with status changes
    const recentAchievements = await Achievement.find({ student: userId })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('title status points createdAt updatedAt');
    
    // Build activity feed
    const activities = [];
    
    // Add achievement activities
    for (const achievement of recentAchievements) {
      if (achievement.status === 'approved') {
        activities.push({
          type: 'achievement_approved',
          text: `Achievement "${achievement.title}" was approved`,
          points: achievement.points,
          time: achievement.updatedAt,
          icon: 'CheckCircle',
          color: 'green'
        });
      } else if (achievement.status === 'rejected') {
        activities.push({
          type: 'achievement_rejected',
          text: `Achievement "${achievement.title}" was rejected`,
          time: achievement.updatedAt,
          icon: 'XCircle',
          color: 'red'
        });
      } else if (achievement.status === 'pending') {
        // Only show if recently created (within last 7 days)
        const daysSinceCreation = (Date.now() - new Date(achievement.createdAt)) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation <= 7) {
          activities.push({
            type: 'achievement_submitted',
            text: `Achievement "${achievement.title}" submitted for review`,
            time: achievement.createdAt,
            icon: 'Clock',
            color: 'orange'
          });
        }
      }
    }
    
    // Get user's current points
    const user = await User.findById(userId).select('totalPoints');
    if (user && user.totalPoints > 0) {
      activities.push({
        type: 'points_updated',
        text: `You now have ${user.totalPoints} points`,
        time: new Date(),
        icon: 'TrendingUp',
        color: 'blue'
      });
    }
    
    // Sort by time (most recent first) and limit to 5
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentActivities = activities.slice(0, 5);
    
    // Add relative time strings
    const activitiesWithRelativeTime = recentActivities.map(activity => ({
      ...activity,
      relativeTime: getRelativeTime(new Date(activity.time))
    }));
    
    res.json(activitiesWithRelativeTime);
  } catch (err) {
    console.error("Get activities error:", err);
    res.status(500).json({ message: err.message });
  }
}

function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}
