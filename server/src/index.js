import app from './app.js';
import dotenv from 'dotenv';
import { setupSocketIO } from './config/socket.js';
import jobService from './services/jobService.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`   TRACKPREP SERVER IS RUNNING ONLINE   `);
  console.log(`========================================`);
  console.log(` * Address: http://localhost:${PORT}`);
  console.log(` * Environment: ${NODE_ENV}`);
  console.log(` * CORS Allowed Origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(` * Mock Auth status: ${process.env.DEV_MOCK_AUTH === 'true' ? 'ENABLED (Bypassing OAuth)' : 'DISABLED'}`);
  console.log(`========================================`);
});

// Initialize Socket.io configuration
setupSocketIO(server);

// Start background schedulers (Phase 5 skeleton)
jobService.startBackgroundJobs();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  
  // Stop and clean up background scheduler processes
  jobService.stopAllJobs();

  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
