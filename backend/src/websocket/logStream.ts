import { FastifyInstance } from 'fastify';
import WebSocket from 'ws';
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
    async (socket: WebSocket, req) => {
      const { id } = req.params as { id: string };
      const channel = `logs:${id}`;

      // Each subscriber needs its own Redis client connection
      const sub = getRedis().duplicate();
      await sub.subscribe(channel);

      const cleanup = async () => {
        await sub.unsubscribe(channel);
        sub.disconnect();
      };

      sub.on('message', (_chan: string, message: string) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(message);
        }
      });

      socket.on('close', cleanup);
      socket.on('error', cleanup);
    }
  );
}
