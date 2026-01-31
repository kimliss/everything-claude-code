#!/usr/bin/env node

/**
 * Stop Hook: Check for fmt.Print* debug statements in modified Go files
 *
 * This hook runs after each response and checks if any modified
 * Go files contain fmt.Println/fmt.Printf statements that may be
 * leftover debug prints. It provides warnings to help developers
 * remember to remove debug statements before committing.
 */

const { execSync } = require('child_process');
const fs = require('fs');

let data = '';

// Read stdin
process.stdin.on('data', chunk => {
  data += chunk;
});

process.stdin.on('end', () => {
  try {
    // Check if we're in a git repository
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    } catch {
      // Not in a git repo, just pass through the data
      console.log(data);
      process.exit(0);
    }

    // Get list of modified files
    const files = execSync('git diff --name-only HEAD', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    })
      .split('\n')
      .filter(f => /\.go$/.test(f) && fs.existsSync(f));

    let hasDebugPrint = false;

    // Check each file for fmt.Print* (but not in comments or logging calls)
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      const matches = [];

      lines.forEach((line, idx) => {
        // Match fmt.Println, fmt.Printf, fmt.Print but skip commented lines
        if (/fmt\.Print(ln|f)?\(/.test(line)) {
          const beforePrint = line.split('fmt.Print')[0];
          // Skip if it's a comment
          if (!/\/\//.test(beforePrint)) {
            matches.push(`  ${idx + 1}: ${line.trim()}`);
          }
        }
      });

      if (matches.length > 0) {
        console.error(`[Hook] WARNING: fmt.Print* found in ${file}`);
        matches.slice(0, 5).forEach(m => console.error(m));
        hasDebugPrint = true;
      }
    }

    if (hasDebugPrint) {
      console.error('[Hook] Remove debug print statements before committing');
      console.error('[Hook] Use structured logging (slog) instead of fmt.Print*');
    }
  } catch (_error) {
    // Silently ignore errors (git might not be available, etc.)
  }

  // Always output the original data
  console.log(data);
});
