#!/usr/bin/env node
/**
 * Post-Go-Build Hook (Async)
 * 在 go build 完成后异步运行 go vet 检查
 */

const { execSync } = require('child_process');

let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  console.error('[Hook] Build completed - running go vet in background...');

  try {
    const input = JSON.parse(data);
    const command = input.tool_input?.command || '';

    // 提取工作目录
    const cwd = process.cwd();

    // 异步运行 go vet
    try {
      const result = execSync('go vet ./... 2>&1', {
        cwd: cwd,
        encoding: 'utf8',
        timeout: 30000 // 30秒超时
      });

      if (result.trim()) {
        console.error('[Hook] go vet found issues:');
        console.error(result.trim());
      } else {
        console.error('[Hook] go vet: no issues found ✓');
      }
    } catch (e) {
      if (e.killed) {
        console.error('[Hook] go vet timed out');
      } else {
        const output = (e.stdout || '') + (e.stderr || '');
        if (output.trim()) {
          console.error('[Hook] go vet issues:');
          console.error(output.trim());
        }
      }
    }
  } catch (e) {
    console.error('[Hook] Error in post-go-build:', e.message);
  }

  console.log(data);
});
