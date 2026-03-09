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
    await TaskStore.bulkCreate(requestId, taskDescriptions);

    // ── 2. Generate Code ─────────────────────────────────────────────────────
    await log('Generator agent: producing project files…');
    const files = await generatorAgent(prompt, taskDescriptions, githubToken!, model);
    
    await log(`Generator produced ${files.length} files`);

    // ── 3. Push to GitHub ────────────────────────────────────────────────────
    await log(targetRepo
      ? `Committing to existing repo ${targetRepo.owner}/${targetRepo.repo}…`
      : 'Pushing project to new GitHub repo…'
    );
    const repoUrl = await pushToGitHub(requestId, prompt, files, targetRepo, githubToken);
    await log(`Project pushed to ${repoUrl}`);

    await RequestStore.updateStatus(requestId, 'completed', repoUrl);
    await log('Pipeline finished with status: completed');

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    await log(`Unexpected pipeline error: ${message}`, 'error');
    await RequestStore.updateStatus(requestId, 'failed');
  }
}
