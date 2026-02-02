#!/usr/bin/env node
/**
 * Post-Go-Edit Hook
 * 合并的 Go 文件编辑后处理脚本，包含：
 * 1. gofmt 自动格式化
 * 2. go vet 静态检查
 * 3. fmt.Print* 调试语句扫描
 */

const { execFileSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path;

    if (!filePath || !fs.existsSync(filePath)) {
      console.log(data);
      return;
    }

    // 1. 运行 gofmt 格式化
    try {
      execFileSync('gofmt', ['-w', filePath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } catch (e) {
      console.error('[Hook] gofmt failed:', e.message);
    }

    // 2. 运行 go vet 检查
    let vetDir = path.dirname(filePath);
    while (vetDir !== path.dirname(vetDir) && !fs.existsSync(path.join(vetDir, 'go.mod'))) {
      vetDir = path.dirname(vetDir);
    }

    if (fs.existsSync(path.join(vetDir, 'go.mod'))) {
      try {
        const result = execSync('go vet ./... 2>&1', {
          cwd: vetDir,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        if (result.trim()) {
          console.error('[Hook] go vet warnings:');
          console.error(result.trim());
        }
      } catch (e) {
        const output = (e.stdout || '') + (e.stderr || '');
        if (output) {
          // 显示所有错误，不只是当前文件的
          const lines = output.split('\n').filter(l => l.trim()).slice(0, 15);
          if (lines.length) {
            console.error('[Hook] go vet issues found:');
            lines.forEach(line => console.error(line));
          }
        }
      }
    }

    // 3. 检查 fmt.Print* 调试语句（改进的检测）
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const matches = [];

    lines.forEach((line, idx) => {
      // 简单但更准确的检测：检查行中是否有 fmt.Print 且不在注释中
      const trimmed = line.trim();
      // 跳过明显的注释行
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        return;
      }

      // 检测 fmt.Print*
      if (/fmt\.Print(ln|f)?\\(/.test(line)) {
        // 检查是否在行内注释之前
        const commentIndex = line.indexOf('//');
        const printIndex = line.indexOf('fmt.Print');
        if (commentIndex === -1 || printIndex < commentIndex) {
          matches.push(`${idx + 1}: ${line.trim()}`);
        }
      }
    });

    if (matches.length) {
      console.error('[Hook] WARNING: fmt.Print* statements found in', path.basename(filePath));
      matches.slice(0, 5).forEach(m => console.error('  ' + m));
      if (matches.length > 5) {
        console.error(`  ... and ${matches.length - 5} more`);
      }
      console.error('[Hook] Consider removing debug print statements before committing');
    }

  } catch (e) {
    console.error('[Hook] Error in post-go-edit:', e.message);
  }

  // 总是输出原始数据
  console.log(data);
});
