import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import passport from './config/passport.js';
import { pool } from './config/db.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import appRoutes from './routes/appRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();

// 1. Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://lh3.googleusercontent.com', 'https://cdn-icons-png.flaticon.com'],
        connectSrc: ["'self'", 'http://localhost:5000', 'http://localhost:5173'],
      },
    },
  })
);

// 2. CORS configuration (allowing React app requests with cookies)
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Request Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Session Configuration with Postgres Storage
const pgSessionStore = pgSession(session);
let store;

try {
  store = new pgSessionStore({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: false, // schema.sql handles this
  });
} catch (err) {
  console.warn('Postgres session storage initialization failed. Falling back to MemoryStore.', err.message);
}

app.use(
  session({
    store: store,
    secret: process.env.SESSION_SECRET || 'trackprep_secret_fallback',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
);

// 5. Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// 6. Rate Limiting for overall APIs
app.use('/api', apiLimiter);

// 7. Route Mountings
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/applications', appRoutes);
app.use('/api/tasks', taskRoutes);

// Fallbacks for undefined routes and general errors
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
