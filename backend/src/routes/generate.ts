import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RequestStore } from '../../services/redisStore';
import { enqueueGenerate } from '../../queue/producer';
import { authenticate } from '../middleware/authenticate';

interface GenerateBody {
  prompt:      string;
  targetRepo?: { owner: string; repo: string };
  model?:      string;
}

export async function generateRoute(app: FastifyInstance) {
  app.post<{ Body: GenerateBody }>(
    '/generate-project',
    {
      preHandler: [authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['prompt'],
          properties: {
            prompt:     { type: 'string', minLength: 10, maxLength: 4000 },
            targetRepo: {
              type: 'object',
              properties: {
                owner: { type: 'string' },
                repo:  { type: 'string' },
              },
              required: ['owner', 'repo'],
            },
          },
        },
      },
    },
    async (req: FastifyRequest<{ Body: GenerateBody }>, reply: FastifyReply) => {
      const { prompt, targetRepo, model } = req.body;
      const { userId } = req.user;

      const request = await RequestStore.create(prompt, userId);
      await enqueueGenerate(request.id, prompt, targetRepo, userId, model);

      reply.code(202).send({ requestId: request.id, status: request.status });
    }
  );
}
