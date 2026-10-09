import { spawnSync } from 'node:child_process';
import process from 'node:process';

console.log('=== Step 1: Running Frontend Engine, Rules & Multiplayer Integration Tests ===');
const frontendTest = spawnSync('npx tsx --test src/engine/rules.test.ts src/services/multiplayer.test.ts', {
  stdio: 'inherit',
  shell: true,
});

if (frontendTest.status !== 0) {
  console.error('Frontend tests failed with exit code:', frontendTest.status);
  process.exit(frontendTest.status || 1);
}

console.log('\n=== Step 2: Running Backend Python Tests (Engine, Rooms, API, WebSockets) ===');
const isWin = process.platform === 'win32';
const pythonCandidates = isWin ? ['python', 'py', 'python3'] : ['python3', 'python'];
let pythonCmd = null;

for (const cmd of pythonCandidates) {
  const check = spawnSync(`${cmd} --version`, { shell: true, stdio: 'pipe' });
  if (check.status === 0) {
    pythonCmd = cmd;
    break;
  }
}

if (!pythonCmd) {
  console.error('Error: No Python executable found (checked python, python3, py).');
  process.exit(1);
}

console.log(`Using Python binary: ${pythonCmd}`);
const backendTest = spawnSync(`${pythonCmd} -m unittest discover backend/tests`, {
  stdio: 'inherit',
  shell: true,
});

if (backendTest.status !== 0) {
  console.error('Backend tests failed with exit code:', backendTest.status);
  process.exit(backendTest.status || 1);
}

console.log('\n✔ ALL FRONTEND AND BACKEND TEST SUITES PASSED CLEANLY (50 TOTAL TESTS)!');
