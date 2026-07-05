import express from 'express';
import os from 'os';
import { errorHandler } from './middleware/error';
import { logger } from './middleware/logger';
import authRouter from './routes/auth';
import customersRouter from './routes/customers';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/customers', customersRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    instance: os.hostname(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || 'placeholder',
  });
});

// Basic root so nginx/nginx-proxy health checks have something
app.get('/', (_req, res) => {
  res.send('Placeholder backend service');
});

// 404 and error handling
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Placeholder backend running on port ${PORT} | Instance: ${os.hostname()}`);
  });
}

export default app;
