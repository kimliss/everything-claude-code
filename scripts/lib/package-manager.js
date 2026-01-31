/**
 * Go Toolchain Detection and Configuration
 * Automatically detects Go development tools and their availability
 *
 * Supports: go, golangci-lint, air, buf, protoc, wire, mockgen
 */

const fs = require('fs');
const path = require('path');
const { commandExists, getClaudeDir, readFile, writeFile } = require('./utils');

// Go tool definitions
const GO_TOOLS = {
  go: {
    name: 'go',
    description: 'Go compiler and toolchain',
    required: true,
    checkCmd: 'go',
    buildCmd: 'go build ./...',
    testCmd: 'go test ./...',
    runCmd: 'go run',
    fmtCmd: 'gofmt -w',
    vetCmd: 'go vet ./...'
  },
  'golangci-lint': {
    name: 'golangci-lint',
    description: 'Go linter aggregator',
    required: false,
    checkCmd: 'golangci-lint',
    lintCmd: 'golangci-lint run ./...'
  },
  air: {
    name: 'air',
    description: 'Live reload for Go apps',
    required: false,
    checkCmd: 'air',
    devCmd: 'air'
  },
  buf: {
    name: 'buf',
    description: 'Protocol buffer toolchain',
    required: false,
    checkCmd: 'buf',
    genCmd: 'buf generate'
  },
  protoc: {
    name: 'protoc',
    description: 'Protocol buffer compiler',
    required: false,
    checkCmd: 'protoc'
  },
  wire: {
    name: 'wire',
    description: 'Compile-time dependency injection',
    required: false,
    checkCmd: 'wire'
  },
  mockgen: {
    name: 'mockgen',
    description: 'Mock generator for Go interfaces',
    required: false,
    checkCmd: 'mockgen'
  },
  'docker-compose': {
    name: 'docker compose',
    description: 'Container orchestration for local dev',
    required: false,
    checkCmd: 'docker'
  }
};

// Config file path
function getConfigPath() {
  return path.join(getClaudeDir(), 'go-toolchain.json');
}

/**
 * Load saved Go toolchain configuration
 */
function loadConfig() {
  const configPath = getConfigPath();
  const content = readFile(configPath);

  if (content) {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Save Go toolchain configuration
 */
function saveConfig(config) {
  const configPath = getConfigPath();
  writeFile(configPath, JSON.stringify(config, null, 2));
}

/**
 * Detect if current directory is a Go project
 */
function isGoProject(projectDir = process.cwd()) {
  return fs.existsSync(path.join(projectDir, 'go.mod'));
}

/**
 * Get Go module name from go.mod
 */
function getModuleName(projectDir = process.cwd()) {
  const goModPath = path.join(projectDir, 'go.mod');
  const content = readFile(goModPath);
  if (content) {
    const match = content.match(/^module\s+(.+)$/m);
    if (match) return match[1].trim();
  }
  return null;
}

/**
 * Get Go version from go.mod
 */
function getGoVersion(projectDir = process.cwd()) {
  const goModPath = path.join(projectDir, 'go.mod');
  const content = readFile(goModPath);
  if (content) {
    const match = content.match(/^go\s+(.+)$/m);
    if (match) return match[1].trim();
  }
  return null;
}

/**
 * Get available Go tools (installed on system)
 */
function getAvailableTools() {
  const available = [];

  for (const [toolName, tool] of Object.entries(GO_TOOLS)) {
    if (commandExists(tool.checkCmd)) {
      available.push(toolName);
    }
  }

  return available;
}

/**
 * Get missing required tools
 */
function getMissingRequired() {
  const missing = [];

  for (const [toolName, tool] of Object.entries(GO_TOOLS)) {
    if (tool.required && !commandExists(tool.checkCmd)) {
      missing.push(toolName);
    }
  }

  return missing;
}

/**
 * Get the Go toolchain info for the current project
 *
 * @param {object} options - { projectDir }
 * @returns {object} - { name, goVersion, moduleName, tools, source }
 */
function getPackageManager(options = {}) {
  const { projectDir = process.cwd() } = options;

  const available = getAvailableTools();
  const moduleName = getModuleName(projectDir);
  const goVersion = getGoVersion(projectDir);
  const isGo = isGoProject(projectDir);

  let source = 'detection';

  // Check environment variable override
  if (process.env.CLAUDE_GO_TOOLS_CONFIG) {
    source = 'environment';
  }

  // Check project config
  const projectConfigPath = path.join(projectDir, '.claude', 'go-toolchain.json');
  if (fs.existsSync(projectConfigPath)) {
    source = 'project-config';
  }

  return {
    name: 'go',
    config: GO_TOOLS.go,
    source: source,
    isGoProject: isGo,
    goVersion: goVersion,
    moduleName: moduleName,
    availableTools: available
  };
}

/**
 * Interactive prompt for Go toolchain status
 * Returns a message for Claude to show to user
 */
function getSelectionPrompt() {
  const available = getAvailableTools();
  const missing = getMissingRequired();
  const moduleName = getModuleName();
  const goVersion = getGoVersion();

  let message = '[GoToolchain] Go development environment:\n';

  if (moduleName) {
    message += `  Module: ${moduleName}\n`;
  }
  if (goVersion) {
    message += `  Go version: ${goVersion}\n`;
  }

  message += '\n  Available tools:\n';
  for (const [toolName, tool] of Object.entries(GO_TOOLS)) {
    const installed = available.includes(toolName);
    const indicator = installed ? '✓' : '✗';
    const required = tool.required ? ' (required)' : '';
    message += `    ${indicator} ${toolName} - ${tool.description}${required}\n`;
  }

  if (missing.length > 0) {
    message += `\n  Missing required tools: ${missing.join(', ')}\n`;
    message += '  Install Go: https://go.dev/dl/\n';
  }

  message += '\n  Recommended optional tools:\n';
  message += '    go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest\n';
  message += '    go install github.com/air-verse/air@latest\n';
  message += '    go install go.uber.org/mock/mockgen@latest\n';

  return message;
}

module.exports = {
  GO_TOOLS,
  getPackageManager,
  getAvailableTools,
  getMissingRequired,
  isGoProject,
  getModuleName,
  getGoVersion,
  getSelectionPrompt,
  loadConfig,
  saveConfig
};
