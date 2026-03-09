import { FastifyInstance, FastifyRequest } from 'fastify';
import { RequestStore } from '../../services/redisStore';

export async function requestRoute(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>(
    '/request/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const request = await RequestStore.findById(req.params.id);
      if (!request) return reply.code(404).send({ error: 'Request not found' });
      return request;
    }
  );
}
