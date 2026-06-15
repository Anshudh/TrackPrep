import app from './app.js';
import dotenv from 'dotenv';

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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
