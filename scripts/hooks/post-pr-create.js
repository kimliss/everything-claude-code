#!/usr/bin/env node
/**
 * Post-PR-Create Hook
 * 提取 PR URL 并提供 review 命令（改进版：支持 JSON 输出）
 */

let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const cmd = input.tool_input?.command || '';
    const output = input.tool_output?.output || '';

    if (/gh pr create/.test(cmd)) {
      // 方法1：尝试解析 JSON 输出（如果使用了 --json 标志）
      try {
        const jsonMatch = output.match(/\{[^{}]*"url"[^{}]*\}/);
        if (jsonMatch) {
          const prData = JSON.parse(jsonMatch[0]);
          const url = prData.url;
          const prNumber = url.match(/\/pull\/(\d+)/)?.[1];
          const repo = url.match(/github\.com\/([^/]+\/[^/]+)\/pull/)?.[1];

          console.error('[Hook] PR created:', url);
          if (prNumber && repo) {
            console.error('[Hook] To review: gh pr review', prNumber, '--repo', repo);
          }
          console.log(data);
          return;
        }
      } catch (e) {
        // 继续尝试正则匹配
      }

      // 方法2：正则匹配 URL（后备方案）
      const urlMatch = output.match(/https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/);
      if (urlMatch) {
        const url = urlMatch[0];
        const repo = url.replace(/https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/\d+/, '$1');
        const prNumber = url.replace(/.*\/pull\/(\d+)/, '$1');

        console.error('[Hook] PR created:', url);
        console.error('[Hook] To review: gh pr review', prNumber, '--repo', repo);
      }
    }
  } catch (e) {
    console.error('[Hook] Error in post-pr-create:', e.message);
  }

  console.log(data);
});
