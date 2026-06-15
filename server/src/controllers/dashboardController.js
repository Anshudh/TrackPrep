import problemService from '../services/problemService.js';
import appService from '../services/appService.js';
import taskService from '../services/taskService.js';

export const getDashboardStats = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const [
      totalProblems,
      totalApplications,
      pendingTasks,
      difficultyStats,
      topicStats,
      appStatusStats
    ] = await Promise.all([
      problemService.getTotalCount(userId).catch(() => 0),
      appService.getTotalCount(userId).catch(() => 0),
      taskService.getPendingCount(userId).catch(() => 0),
      problemService.getDifficultyStats(userId).catch(() => []),
      problemService.getTopicStats(userId).catch(() => []),
      appService.getStatusStats(userId).catch(() => [])
    ]);

    // Format stats for Recharts convenience
    // For example, fill missing statuses or difficulties if needed, 
    // but the frontend can handle raw DB groupings.
    
    return res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalProblems,
          totalApplications,
          pendingTasks
        },
        charts: {
          difficulty: difficultyStats,
          topic: topicStats,
          applicationStatus: appStatusStats
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
