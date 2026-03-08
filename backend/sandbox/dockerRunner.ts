import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { GeneratedFile } from '../agents/generator';

const execFileAsync = promisify(execFile);

const TIMEOUT_MS = Number(process.env.SANDBOX_TIMEOUT_MS ?? 60_000);

export interface SandboxResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/**
 * Writes generated files to a temporary directory, builds a Docker image,
 * runs the container, and returns the execution result.
 */
export async function runInSandbox(
  requestId: string,
  files: GeneratedFile[]
): Promise<SandboxResult> {
  // 1. Create a temp workspace
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), `autodev-${requestId}-`));

  try {
    // 2. Write files into the workspace
    for (const file of files) {
      const dest = path.join(workDir, file.path);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, file.content, 'utf8');
    }

    // 3. Ensure a Dockerfile exists; inject a default one if the LLM omitted it.
    //    Also replace `npm ci` with `npm install` — generated projects rarely
    //    include a package-lock.json, which npm ci requires.
    const dockerfilePath = path.join(workDir, 'Dockerfile');
    if (!fs.existsSync(dockerfilePath)) {
      fs.writeFileSync(dockerfilePath, generateDefaultDockerfile(files), 'utf8');
    } else {
      const original = fs.readFileSync(dockerfilePath, 'utf8');
      const patched  = original.replace(/npm ci(\b)/g, 'npm install$1');
      if (patched !== original) fs.writeFileSync(dockerfilePath, patched, 'utf8');
    }

    const imageTag = `autodev-run-${requestId.slice(0, 8)}`;

    // 4. Build Docker image (force BuildKit to avoid legacy-builder deprecation failure)
    await execFileAsync('docker', ['build', '-t', imageTag, '.'], {
      cwd:     workDir,
      timeout: TIMEOUT_MS,
      env:     { ...process.env, DOCKER_BUILDKIT: '0' },
    });

    // 5. Run container with resource limits
    const { stdout, stderr } = await execFileAsync(
      'docker',
      [
        'run',
        '--rm',
        '--network', 'none',       // no network access inside sandbox
        '--memory', '512m',
        '--cpus',   '1',
        '--read-only',
        '--tmpfs', '/tmp:rw,size=64m',
        imageTag,
      ],
      { timeout: TIMEOUT_MS }
    ).catch((err: NodeJS.ErrnoException & { stdout?: string; stderr?: string; code?: number }) => ({
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? `${err.message}`,
      exitCode: typeof err.code === 'number' ? err.code : 1,
    })) as { stdout: string; stderr: string; exitCode?: number };

    // 6. Clean up Docker image
    await execFileAsync('docker', ['rmi', '-f', imageTag]).catch(() => {});

    // Infer exit code: if stderr has content and stdout is empty treat as failure
    const exitCode = (stderr && !stdout) ? 1 : 0;
    return { exitCode, stdout: stdout ?? '', stderr: stderr ?? '' };

  } finally {
    // 7. Clean up workspace
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

/**
 * Fallback Dockerfile when the LLM-generated project doesn't include one.
 * Detects Node.js vs Python by checking file extensions.
 */
function generateDefaultDockerfile(files: GeneratedFile[]): string {
  const hasPython  = files.some((f) => f.path.endsWith('.py'));
  const hasPackage = files.some((f) => f.path === 'package.json');

  if (hasPython) {
    return [
      'FROM python:3.11-slim',
      'WORKDIR /app',
      'COPY requirements.txt* ./',
      'RUN pip install --no-cache-dir -r requirements.txt 2>/dev/null || true',
      'COPY . .',
      'CMD ["python", "app.py"]',
    ].join('\n');
  }

  if (hasPackage) {
    return [
      'FROM node:20-alpine',
      'WORKDIR /app',
      'COPY package*.json ./',
      'RUN npm ci --omit=dev',
      'COPY . .',
      'CMD ["npm", "start"]',
    ].join('\n');
  }

  return [
    'FROM alpine:3.19',
    'WORKDIR /app',
    'COPY . .',
    'CMD ["sh", "-c", "echo AutoDev sandbox started && ls -la"]',
  ].join('\n');
}
