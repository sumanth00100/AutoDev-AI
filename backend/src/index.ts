import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt  from '@fastify/jwt';
import websocket from '@fastify/websocket';

import { generateRoute }  from './routes/generate';
import { requestRoute }   from './routes/request';
import { logsRoute }      from './routes/logs';
import { tasksRoute }     from './routes/tasks';
import { reposRoute }     from './routes/repos';
import { authRoute }      from './routes/auth';
import { wsLogStream }    from './websocket/logStream';
import { startWorker }    from '../queue/worker';

const PORT = Number(process.env.PORT ?? 3001);
console.log(`[Startup] PORT=${PORT} NODE_ENV=${process.env.NODE_ENV} REDIS_URL=${process.env.REDIS_URL ? 'set' : 'NOT SET'}`);

async function bootstrap() {
  const app = Fastify({
    logger: {
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  // ── Plugins ────────────────────────────────────────────────────────────────
  await app.register(cors, {
    origin:         process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods:        ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.register(jwt, { secret: process.env.JWT_SECRET! });
  await app.register(websocket);

  // ── REST Routes ────────────────────────────────────────────────────────────
  await app.register(authRoute,     { prefix: '/api' });
  await app.register(generateRoute, { prefix: '/api' });
  await app.register(requestRoute,  { prefix: '/api' });
  await app.register(logsRoute,     { prefix: '/api' });
  await app.register(tasksRoute,    { prefix: '/api' });
  await app.register(reposRoute,    { prefix: '/api' });

  // ── WebSocket ──────────────────────────────────────────────────────────────
  await app.register(wsLogStream,   { prefix: '/ws' });

  // ── Health ─────────────────────────────────────────────────────────────────
  app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

  // ── Background worker ──────────────────────────────────────────────────────
  if (process.env.REDIS_URL) {
    try {
      startWorker();
    } catch (err) {
      app.log.error({ err }, 'Worker failed to start');
    }
  } else {
    app.log.warn('REDIS_URL not set — background worker disabled');
  }

  // ── Start ──────────────────────────────────────────────────────────────────
  await app.listen({ port: PORT, host: '0.0.0.0' });
  app.log.info(`AutoEngineer backend running on http://0.0.0.0:${PORT}`);

  // ── Shutdown ───────────────────────────────────────────────────────────────
  const shutdown = async () => {
    app.log.info('Shutting down…');
    await app.close();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT',  shutdown);
}

process.on('unhandledRejection', (reason) => {
  console.error('[Process] unhandledRejection:', reason);
});

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
