import { FastifyInstance } from 'fastify';
import { getRedis } from '../../queue/redis';

/**
 * WebSocket endpoint: ws://host/ws/logs/:id
 *
 * Clients subscribe to a Redis pub/sub channel for a specific requestId.
 * The pipeline publishes log entries as they are created; clients receive them
 * in real time without polling.
 */
export async function wsLogStream(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>(
    '/logs/:id',
    { websocket: true },
    async (connection, req) => {
      const { id } = req.params as { id: string };
      const channel = `logs:${id}`;

      // Each subscriber needs its own Redis client connection
      const sub = getRedis().duplicate();
      await sub.subscribe(channel);

      sub.on('message', (_chan: string, message: string) => {
        if (connection.socket.readyState === 1 /* OPEN */) {
          connection.socket.send(message);
        }
      });

      connection.socket.on('close', async () => {
        await sub.unsubscribe(channel);
        sub.disconnect();
      });

      connection.socket.on('error', async () => {
        await sub.unsubscribe(channel);
        sub.disconnect();
      });
    }
  );
}
