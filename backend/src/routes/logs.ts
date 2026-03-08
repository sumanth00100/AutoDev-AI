import { FastifyInstance, FastifyRequest } from 'fastify';
import { LogRepo } from '../../database/repositories';

export async function logsRoute(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>(
    '/logs/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string', format: 'uuid' } },
        },
      },
    },
    async (req: FastifyRequest<{ Params: { id: string } }>) => {
      return LogRepo.findByRequestId(req.params.id);
    }
  );
}
