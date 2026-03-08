import { FastifyInstance, FastifyRequest } from 'fastify';
import { RequestRepo } from '../../database/repositories';

export async function requestRoute(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>(
    '/request/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string', format: 'uuid' } },
        },
      },
    },
    async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const request = await RequestRepo.findById(req.params.id);
      if (!request) return reply.code(404).send({ error: 'Request not found' });
      return request;
    }
  );
}
