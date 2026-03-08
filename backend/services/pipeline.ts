import { RequestRepo, TaskRepo, FileRepo, LogRepo } from '../database/repositories';
import { plannerAgent }   from '../agents/planner';
import { generatorAgent } from '../agents/generator';
import { debuggerAgent }  from '../agents/debugger';
import { runInSandbox }   from '../sandbox/dockerRunner';
import { pushToGitHub }   from './github';
import { publishLog }     from './logPublisher';

const MAX_DEBUG_RETRIES = Number(process.env.SANDBOX_MAX_RETRIES ?? 3);

export async function runPipeline(
  requestId:   string,
  prompt:      string,
  targetRepo?: { owner: string; repo: string }
): Promise<void> {
  const log = async (message: string, level: 'info' | 'warn' | 'error' | 'debug' = 'info') => {
    await LogRepo.append(requestId, message, level);
    await publishLog(requestId, { message, level, ts: new Date().toISOString() });
    console.log(`[Pipeline][${requestId}] ${message}`);
  };

  try {
    await RequestRepo.updateStatus(requestId, 'running');
    if (targetRepo) {
      await log(`Using existing repo: ${targetRepo.owner}/${targetRepo.repo}`);
    }
    await log('Pipeline started');

    // ── 1. Plan ──────────────────────────────────────────────────────────────
    await log('Planner agent: breaking down project into tasks…');
    const taskDescriptions = await plannerAgent(prompt);
    await log(`Planner produced ${taskDescriptions.length} tasks`);
    await TaskRepo.bulkCreate(requestId, taskDescriptions);

    // ── 2. Generate Code ─────────────────────────────────────────────────────
    await log('Generator agent: producing project files…');
    let files = await generatorAgent(prompt, taskDescriptions);
    await FileRepo.bulkUpsert(requestId, files);
    await log(`Generator produced ${files.length} files`);

    // ── 3. Execute in Sandbox (with debug retry loop) ─────────────────────────
    let attempt = 0;
    let success = false;

    while (attempt <= MAX_DEBUG_RETRIES) {
      attempt++;
      await log(`Sandbox run #${attempt}…`);

      const { exitCode, stdout, stderr } = await runInSandbox(requestId, files);

      if (stdout) await log(`[sandbox stdout]\n${stdout}`, 'debug');
      if (stderr) await log(`[sandbox stderr]\n${stderr}`, 'warn');

      if (exitCode === 0) {
        await log('Sandbox execution succeeded');
        success = true;
        break;
      }

      await log(`Sandbox exited with code ${exitCode}`, 'error');

      if (attempt > MAX_DEBUG_RETRIES) {
        await log('Max debug retries reached – marking request as failed', 'error');
        break;
      }

      await log(`Debugger agent: analysing errors (attempt ${attempt}/${MAX_DEBUG_RETRIES})…`);
      const errorContext = `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`;
      files = await debuggerAgent(prompt, files, errorContext);
      await FileRepo.bulkUpsert(requestId, files);
      await log(`Debugger agent applied fixes – retrying sandbox…`);
    }

    if (!success) {
      await RequestRepo.updateStatus(requestId, 'failed');
      await log('Pipeline finished with status: failed', 'error');
      return;
    }

    // ── 5. Push to GitHub ────────────────────────────────────────────────────
    await log(targetRepo
      ? `Committing to existing repo ${targetRepo.owner}/${targetRepo.repo}…`
      : 'Pushing project to new GitHub repo…'
    );
    const repoUrl = await pushToGitHub(requestId, files, targetRepo);
    await log(`Project pushed to ${repoUrl}`);

    await RequestRepo.updateStatus(requestId, 'completed', repoUrl);
    await log('Pipeline finished with status: completed');

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    await log(`Unexpected pipeline error: ${message}`, 'error');
    await RequestRepo.updateStatus(requestId, 'failed');
  }
}
