import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import healthRouter from './routes/health.js';
import filmsRouter from './routes/films.js';
import recommendationsRouter from './routes/recommendations.js';
import libraryRouter from './routes/library.js';
import aiRouter from './routes/ai.js';
import profileRouter from './routes/profile.js';
import notificationsRouter from './routes/notifications.js';
import socialRouter from './routes/social.js';
import { initializeFirebase } from './services/firebase.js';

// ============================================================
// Initialise Sentry (must be before anything else)
// ============================================================
Sentry.init({
  dsn: env.SENTRY_DSN_API,
  environment: env.NODE_ENV,
  tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
});

// ============================================================
// Create Express app
// ============================================================
const app = express();

// Initialize Firebase Admin (FCM)
initializeFirebase();

// ============================================================
// Security & Parsing Middleware
// ============================================================
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGINS.split(','),
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (lightweight — no external service needed)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================================
// Routes
// ============================================================
app.get('/', (_req, res) => {
  res.json({ name: 'Flick API', version: '0.0.1', status: 'running' });
});

app.use('/health', healthRouter);
app.use('/api/films', filmsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/library', libraryRouter);
app.use('/api/ai', aiRouter);
app.use('/api/profile', profileRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/social', socialRouter);

// ============================================================
// Error handling (must be last)
// ============================================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================
// Start server
// ============================================================
const PORT = parseInt(env.PORT, 10);
app.listen(PORT, () => {
  console.log(`🎬 Flick API running on port ${PORT} [${env.NODE_ENV}]`);
});

export default app;
