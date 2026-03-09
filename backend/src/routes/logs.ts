import { FastifyInstance, FastifyRequest } from 'fastify';
import { LogStore } from '../../services/redisStore';

export async function logsRoute(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>(
    '/logs/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>) => {
      return LogStore.findByRequestId(req.params.id);
    }
  );
}
