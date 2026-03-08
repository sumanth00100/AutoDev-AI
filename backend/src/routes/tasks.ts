import { FastifyInstance, FastifyRequest } from 'fastify';
import { TaskRepo } from '../../database/repositories';

export async function tasksRoute(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>(
    '/tasks/:id',
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
      return TaskRepo.findByRequestId(req.params.id);
    }
  );
}
