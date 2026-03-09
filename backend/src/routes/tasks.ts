import { FastifyInstance, FastifyRequest } from 'fastify';
import { TaskStore } from '../../services/redisStore';

export async function tasksRoute(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>(
    '/tasks/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>) => {
      return TaskStore.findByRequestId(req.params.id);
    }
  );
}
