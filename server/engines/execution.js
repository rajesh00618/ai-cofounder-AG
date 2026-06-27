import { callOpenAI, extractJSON } from '../services/ai.js';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK_DIR = path.join(__dirname, '..', 'sandbox');

if (!fs.existsSync(WORK_DIR)) fs.mkdirSync(WORK_DIR, { recursive: true });

const TIMEOUT = 30000;
const MAX_OUTPUT = 1024 * 100;

const sanitizeFilename = (name) => name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);

const executeInSandbox = (cmd, args, stdin = '') => new Promise((resolve, reject) => {
  const proc = spawn(cmd, args, {
    cwd: WORK_DIR,
    timeout: TIMEOUT,
    env: { PATH: process.env.PATH, HOME: process.env.HOME },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let stdout = '', stderr = '';
  const timer = setTimeout(() => {
    proc.kill('SIGKILL');
    reject(new Error('Execution timed out'));
  }, TIMEOUT);

  proc.stdout.on('data', (d) => { stdout += d.toString(); if (stdout.length > MAX_OUTPUT) proc.kill('SIGKILL'); });
  proc.stderr.on('data', (d) => { stderr += d.toString(); });
  if (stdin) proc.stdin.write(stdin);
  proc.stdin.end();

  proc.on('close', (code) => {
    clearTimeout(timer);
    resolve({ code, stdout: stdout.slice(0, MAX_OUTPUT), stderr: stderr.slice(0, MAX_OUTPUT) });
  });
  proc.on('error', reject);
});

const generateFile = async (apiKey, task) => {
  const prompt = `You are a code generation engine. Given a task description, generate a single file implementation.
Respond in JSON:
{
  "files": [
    {
      "filename": "relative/path/to/file.ext",
      "content": "Complete file content",
      "language": "javascript|python|html|css|json|markdown"
    }
  ],
  "instructions": "How to use/run this"
}`;
  const userPrompt = `Task: ${JSON.stringify(task)}\nGenerate the minimal viable implementation.`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.3);
  return extractJSON(response);
};

export const generateExecutionPlan = async (apiKey, task) => {
  const prompt = `You are an AI execution engine. Given a task, generate a step-by-step execution plan.
Return JSON: {
  "task": "the original task",
  "plan": {
    "estimatedTime": "estimated total time like ~5 minutes",
    "steps": [{ "id": 1, "label": "Step name", "duration": "estimated duration like 30s", "type": "generate|shell|review" }]
  }
}`;
  const userPrompt = `Task: ${JSON.stringify(task)}`;
  const response = await callOpenAI(apiKey, prompt, userPrompt, 0.3);
  return extractJSON(response);
};

export const executeStep = async (apiKey, stepId, task) => {
  try {
    const gen = await generateFile(apiKey, task);
    const outputs = [];

    for (const file of gen.files) {
      const safeName = sanitizeFilename(file.filename);
      const filePath = path.join(WORK_DIR, safeName);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, file.content);
      outputs.push(`Created ${file.filename} (${Buffer.byteLength(file.content, 'utf8')} bytes)`);

      if (file.language === 'javascript' || file.language === 'js') {
        try {
          const result = await executeInSandbox('node', [safeName]);
          if (result.code === 0) {
            outputs.push(`Executed ${file.filename}: ${result.stdout.slice(0, 500)}`);
          } else {
            outputs.push(`Execution output: ${result.stdout.slice(0, 200)}${result.stderr ? ` | Errors: ${result.stderr.slice(0, 200)}` : ''}`);
          }
        } catch (execErr) {
          outputs.push(`Execution note: ${execErr.message}`);
        }
      }

      if (file.language === 'python' || file.language === 'py') {
        try {
          const result = await executeInSandbox('python3', [safeName]);
          if (result.code === 0) {
            outputs.push(`Executed ${file.filename}: ${result.stdout.slice(0, 500)}`);
          } else {
            outputs.push(`Execution output: ${result.stdout.slice(0, 200)}${result.stderr ? ` | Errors: ${result.stderr.slice(0, 200)}` : ''}`);
          }
        } catch (execErr) {
          outputs.push(`Execution note: ${execErr.message}`);
        }
      }

      if (file.language === 'html') {
        const publicDir = path.join(WORK_DIR, 'public');
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
        fs.copyFileSync(filePath, path.join(publicDir, safeName));
        outputs.push(`Deployed ${file.filename} to sandbox/public/`);
      }
    }

    return { output: outputs.join('\n') };
  } catch (err) {
    return { output: `Execution error: ${err.message}` };
  }
};
