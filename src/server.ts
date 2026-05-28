import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// CORS - strict in production, permissive in dev
app.use(cors({
  origin: isProd
    ? (process.env.APP_URL || 'https://your-domain.com')
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: isProd ? 300 : 1000,
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Strict rate limit for AI endpoint
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: isProd ? 5 : 20,
  message: { error: 'AI rate limit exceeded. Please wait a moment.' },
});
app.use('/api/ai', aiLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import routes
import { trailsRouter } from './routes/trails';
import { aiRouter } from './routes/ai';
import { reviewsRouter } from './routes/reviews';
import { authRouter } from './routes/auth';
import { searchRouter } from './routes/search';

app.use('/api/trails', trailsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/auth', authRouter);
app.use('/api/search', searchRouter);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({
    error: isProd ? 'Internal server error' : err.message,
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log('API server running on port ' + PORT + (isProd ? ' (production)' : ' (development)'));
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
