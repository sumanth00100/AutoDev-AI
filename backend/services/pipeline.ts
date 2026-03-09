import { RequestStore, TaskStore, LogStore } from './redisStore';
import { plannerAgent }   from '../agents/planner';
import { generatorAgent } from '../agents/generator';
import { pushToGitHub }   from './github';
import { publishLog }     from './logPublisher';

export async function runPipeline(
  requestId:    string,
  prompt:       string,
  targetRepo:   { owner: string; repo: string } | undefined,
  githubToken?: string,
  model?:       string
): Promise<void> {
  const log = async (message: string, level: 'info' | 'warn' | 'error' | 'debug' = 'info') => {
    await LogStore.append(requestId, message, level);
    await publishLog(requestId, { message, level, ts: new Date().toISOString() });
    console.log(`[Pipeline][${requestId}] ${message}`);
  };

  let tasks: { id: string }[] = [];

  try {
    await RequestStore.updateStatus(requestId, 'running');
    if (targetRepo) {
      await log(`Using existing repo: ${targetRepo.owner}/${targetRepo.repo}`);
    }
    await log('Pipeline started');

    // ── 1. Plan ──────────────────────────────────────────────────────────────
    await log('Planner agent: breaking down project into tasks…');
    const taskDescriptions = await plannerAgent(prompt, githubToken!);
    await log(`Planner produced ${taskDescriptions.length} tasks`);
    tasks = await TaskStore.bulkCreate(requestId, taskDescriptions);

    const n        = tasks.length;
    // Distribute tasks: first task = planning, last task = push, rest = generation
    const genStart = Math.min(1, n - 1);
    const genEnd   = n > 1 ? n - 1 : n;

    // Planning phase done — mark first task completed
    if (n > 0) {
      await TaskStore.updateStatus(tasks[0].id, 'running');
      await TaskStore.updateStatus(tasks[0].id, 'completed');
    }

    // ── 2. Generate Code ─────────────────────────────────────────────────────
    // Mark generation tasks as running
    for (let i = genStart; i < genEnd; i++) {
      await TaskStore.updateStatus(tasks[i].id, 'running');
    }

    await log('Generator agent: producing project files…');
    const files = await generatorAgent(prompt, taskDescriptions, githubToken!, model);
    await log(`Generator produced ${files.length} files`);

    // Generation done — mark generation tasks completed, mark push task running
    for (let i = genStart; i < genEnd; i++) {
      await TaskStore.updateStatus(tasks[i].id, 'completed');
    }
    if (n > 1) {
      await TaskStore.updateStatus(tasks[n - 1].id, 'running');
    }

    // ── 3. Push to GitHub ────────────────────────────────────────────────────
    await log(targetRepo
      ? `Committing to existing repo ${targetRepo.owner}/${targetRepo.repo}…`
      : 'Pushing project to new GitHub repo…'
    );
    const repoUrl = await pushToGitHub(requestId, prompt, files, targetRepo, githubToken);
    await log(`Project pushed to ${repoUrl}`);

    // Push done — mark last task completed
    if (n > 1) {
      await TaskStore.updateStatus(tasks[n - 1].id, 'completed');
    }

    await RequestStore.updateStatus(requestId, 'completed', repoUrl);
    await log('Pipeline finished with status: completed');

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    await log(`Unexpected pipeline error: ${message}`, 'error');
    await RequestStore.updateStatus(requestId, 'failed');

    // Mark any non-completed tasks as failed
    for (const task of tasks) {
      const current = await TaskStore.findByRequestId(requestId);
      const t = current.find(x => x.id === task.id);
      if (t && t.status !== 'completed') {
        await TaskStore.updateStatus(task.id, 'failed');
      }
    }
  }
}
