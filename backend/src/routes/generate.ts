import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RequestRepo } from '../../database/repositories';
import { enqueueGenerate } from '../../queue/producer';

interface GenerateBody {
  prompt:      string;
  targetRepo?: { owner: string; repo: string };
}

export async function generateRoute(app: FastifyInstance) {
  app.post<{ Body: GenerateBody }>(
    '/generate-project',
    {
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
      const { prompt, targetRepo } = req.body;

      const request = await RequestRepo.create(prompt);
      await enqueueGenerate(request.id, prompt, targetRepo);

      reply.code(202).send({ requestId: request.id, status: request.status });
    }
  );
}
