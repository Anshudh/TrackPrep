import emailService from './emailService.js';
import problemService from './problemService.js';
import appService from './appService.js';
import taskService from './taskService.js';

class JobService {
  constructor() {
    this.intervalJobs = [];
    this.cronTasks = [];
    this.isCronEnabled = false;
  }

  async startBackgroundJobs() {
    console.log('Initializing background job schedules...');

    try {
      const cron = await import('node-cron');
      this.isCronEnabled = true;

      // 1. Weekly Progress Report Job (Every Sunday at 8:00 AM)
      const weeklyReportJob = cron.schedule('0 8 * * 0', async () => {
        console.log('[Cron Job] Executing weekly progress report aggregation...');
        await this.generateAndSendWeeklyReports();
      });

      // 2. Email Reminders for pending tasks (Daily at 9:00 AM)
      const dailyReminderJob = cron.schedule('0 9 * * *', async () => {
        console.log('[Cron Job] Executing pending task email reminders check...');
        await this.sendPendingTaskReminders();
      });

      this.cronTasks.push(weeklyReportJob, dailyReminderJob);
      console.log('node-cron jobs successfully scheduled.');
    } catch (err) {
      console.warn('node-cron is not installed. Falling back to simple interval schedules for demonstration.', err.message);
      
      // Simulating a job execution checker every 12 hours
      const checkInterval = 12 * 60 * 60 * 1000; 
      const mockJob = setInterval(async () => {
        console.log('[Interval Scheduler] Triggering automatic tasks check...');
        await this.sendPendingTaskReminders();
      }, checkInterval);
      
      this.intervalJobs.push(mockJob);
    }
  }

  async sendPendingTaskReminders() {
    console.log('[Job Executor] Checking databases for users with active pending tasks...');
    // Real implementation skeleton utilizing taskService:
    // const pendingCount = await taskService.getPendingCount(userId);
    // if (pendingCount > 0) { 
    //   await emailService.sendEmail({ to: user.email, subject: 'You have pending tasks!', text: '...' });
    // }
  }

  async generateAndSendWeeklyReports() {
    console.log('[Job Executor] Aggregating weekly study metrics and recruitment logs...');
    // Real implementation would fetch counts and difficulty metrics, format them, and email:
    // await emailService.sendEmail({ to: user.email, subject: 'Your Weekly Prep Report', html: '...' });
  }

  stopAllJobs() {
    if (this.isCronEnabled) {
      this.cronTasks.forEach(task => task.stop());
      this.cronTasks = [];
    } else {
      this.intervalJobs.forEach(clearInterval);
      this.intervalJobs = [];
    }
    console.log('All background scheduler processes stopped.');
  }
}

export default new JobService();
