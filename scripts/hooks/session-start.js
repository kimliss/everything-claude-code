#!/usr/bin/env node
/**
 * SessionStart Hook - Load previous context on new session
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs when a new Claude session starts. Checks for recent session
 * files and notifies Claude of available context to load.
 * Detects Go toolchain availability.
 */

const {
  getSessionsDir,
  getLearnedSkillsDir,
  findFiles,
  ensureDir,
  log
} = require('../lib/utils');
const { getPackageManager, getSelectionPrompt, getMissingRequired } = require('../lib/package-manager');

async function main() {
  const sessionsDir = getSessionsDir();
  const learnedDir = getLearnedSkillsDir();

  // Ensure directories exist
  ensureDir(sessionsDir);
  ensureDir(learnedDir);

  // Check for recent session files (last 7 days)
  const recentSessions = findFiles(sessionsDir, '*-session.tmp', { maxAge: 7 });

  if (recentSessions.length > 0) {
    const latest = recentSessions[0];
    log(`[SessionStart] Found ${recentSessions.length} recent session(s)`);
    log(`[SessionStart] Latest: ${latest.path}`);
  }

  // Check for learned skills
  const learnedSkills = findFiles(learnedDir, '*.md');

  if (learnedSkills.length > 0) {
    log(`[SessionStart] ${learnedSkills.length} learned skill(s) available in ${learnedDir}`);
  }

  // Detect and report Go toolchain
  const toolchain = getPackageManager();
  if (toolchain.isGoProject) {
    log(`[SessionStart] Go project detected: ${toolchain.moduleName || 'unknown module'}`);
    log(`[SessionStart] Go version: ${toolchain.goVersion || 'not specified in go.mod'}`);
    log(`[SessionStart] Available tools: ${toolchain.availableTools.join(', ')}`);

    const missing = getMissingRequired();
    if (missing.length > 0) {
      log(`[SessionStart] WARNING: Missing required tools: ${missing.join(', ')}`);
    }
  } else {
    log('[SessionStart] No go.mod found - not a Go project or not in project root');
    log(getSelectionPrompt());
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[SessionStart] Error:', err.message);
  process.exit(0); // Don't block on errors
});
