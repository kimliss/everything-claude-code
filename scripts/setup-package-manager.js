#!/usr/bin/env node
/**
 * Go Toolchain Setup Script
 *
 * Checks and reports on available Go development tools.
 * Can be run directly or via a slash command.
 *
 * Usage:
 *   node scripts/setup-package-manager.js
 *   node scripts/setup-package-manager.js --detect
 *   node scripts/setup-package-manager.js --install-tools
 */

const {
  GO_TOOLS,
  getAvailableTools,
  getMissingRequired,
  isGoProject,
  getModuleName,
  getGoVersion
} = require('./lib/package-manager');
const { commandExists } = require('./lib/utils');

function showHelp() {
  console.log(`
Go Toolchain Setup for Claude Code

Usage:
  node scripts/setup-package-manager.js [options]

Options:
  --detect           Detect and show Go toolchain status
  --install-tools    Show install commands for missing tools
  --help             Show this help message

Examples:
  # Detect Go toolchain
  node scripts/setup-package-manager.js --detect

  # Show install commands for missing tools
  node scripts/setup-package-manager.js --install-tools
`);
}

function detectAndShow() {
  const available = getAvailableTools();
  const missing = getMissingRequired();
  const isGo = isGoProject();
  const moduleName = getModuleName();
  const goVersion = getGoVersion();

  console.log('\n=== Go Toolchain Detection ===\n');

  if (isGo) {
    console.log('Project:');
    console.log(`  Module: ${moduleName || 'unknown'}`);
    console.log(`  Go version: ${goVersion || 'not specified'}`);
    console.log('');
  } else {
    console.log('  No go.mod found in current directory\n');
  }

  console.log('Installed tools:');
  for (const [toolName, tool] of Object.entries(GO_TOOLS)) {
    const installed = available.includes(toolName);
    const indicator = installed ? '✓' : '✗';
    const required = tool.required ? ' (REQUIRED)' : '';
    console.log(`  ${indicator} ${toolName} - ${tool.description}${required}`);
  }

  console.log('');

  if (missing.length > 0) {
    console.log(`Missing required tools: ${missing.join(', ')}`);
    console.log('Install Go from: https://go.dev/dl/');
    console.log('');
  }

  console.log('Commands:');
  console.log(`  Build:    go build ./...`);
  console.log(`  Test:     go test ./...`);
  console.log(`  Vet:      go vet ./...`);
  console.log(`  Format:   gofmt -w .`);
  if (available.includes('golangci-lint')) {
    console.log(`  Lint:     golangci-lint run ./...`);
  }
  if (available.includes('air')) {
    console.log(`  Dev:      air`);
  }
  console.log('');
}

function showInstallCommands() {
  const available = getAvailableTools();

  console.log('\n=== Install Missing Go Tools ===\n');

  const installCommands = {
    go: {
      description: 'Go compiler (install from https://go.dev/dl/)',
      command: null
    },
    'golangci-lint': {
      description: 'Linter aggregator',
      command: 'go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest'
    },
    air: {
      description: 'Live reload for Go apps',
      command: 'go install github.com/air-verse/air@latest'
    },
    buf: {
      description: 'Protobuf toolchain',
      command: 'go install github.com/bufbuild/buf/cmd/buf@latest'
    },
    wire: {
      description: 'Compile-time DI',
      command: 'go install github.com/google/wire/cmd/wire@latest'
    },
    mockgen: {
      description: 'Mock generator',
      command: 'go install go.uber.org/mock/mockgen@latest'
    }
  };

  for (const [toolName, info] of Object.entries(installCommands)) {
    const installed = available.includes(toolName);
    if (!installed) {
      console.log(`${toolName} (${info.description}):`);
      if (info.command) {
        console.log(`  ${info.command}`);
      } else {
        console.log(`  Visit https://go.dev/dl/`);
      }
      console.log('');
    }
  }

  const allInstalled = Object.keys(installCommands).every(t =>
    available.includes(t) || t === 'go'
  );

  if (allInstalled && available.includes('go')) {
    console.log('All recommended tools are already installed!\n');
  }
}

// Main
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

if (args.includes('--install-tools')) {
  showInstallCommands();
  process.exit(0);
}

// Default: detect
detectAndShow();
