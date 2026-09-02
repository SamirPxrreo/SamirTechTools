const { exec, execFile } = require('child_process');

function runCommand(command) {
  return new Promise((resolve) => {
    exec(command, { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 10, timeout: 60000 }, (error, stdout, stderr) => {
      if (error) resolve({ success: false, output: stderr || error.message, code: error.code });
      else resolve({ success: true, output: stdout, code: 0 });
    });
  });
}

function ps(script) {
  return new Promise((resolve) => {
    execFile('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
      { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 10, timeout: 60000 },
      (error, stdout, stderr) => {
        if (error) resolve({ success: false, output: stderr || error.message, code: error.code });
        else resolve({ success: true, output: stdout, code: 0 });
      });
  });
}

module.exports = { runCommand, ps };
