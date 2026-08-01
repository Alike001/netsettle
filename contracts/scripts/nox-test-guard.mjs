import { spawn } from 'node:child_process';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

export function hasReportedFailure(output) {
  return (
    /(?:^|\r?\n)\s*\d+\)\s+/m.test(output) ||
    /(?:^|\r?\n)\s*(?:AssertionError|Error|TypeError):/m.test(output)
  );
}

async function run() {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(npmCommand, ['run', 'test:nox:hardhat'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';

  for (const stream of [child.stdout, child.stderr]) {
    stream.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    });
  }

  const exitCode = await new Promise((resolve) => {
    child.once('error', () => resolve(1));
    child.once('close', (code) => resolve(code ?? 1));
  });

  if (exitCode !== 0 || hasReportedFailure(output)) {
    process.exitCode = 1;
  }
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  await run();
}
