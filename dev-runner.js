// dev-runner.js
import { spawn } from 'child_process';
import path from 'path';

console.log('>>> Starting CLUTCH Battle Royale Platform...');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// Start Backend Server
const server = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  shell: true
});

// Start Client Vite Dev Server
const client = spawn(npmCmd, ['run', 'dev', '--prefix', 'client'], {
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  server.kill();
  client.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
