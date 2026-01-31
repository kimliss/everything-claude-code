# Hooks System

## Hook Types

- **PreToolUse**: Before tool execution (validation, parameter modification)
- **PostToolUse**: After tool execution (auto-format, checks)
- **Stop**: When session ends (final verification)

## Current Hooks (in ~/.claude/settings.json)

### PreToolUse
- **tmux reminder**: Suggests tmux for long-running commands (go build, go test, docker compose, etc.)
- **git push review**: Opens editor for review before push
- **doc blocker**: Blocks creation of unnecessary .md/.txt files

### PostToolUse
- **PR creation**: Logs PR URL and GitHub Actions status
- **gofmt**: Auto-formats Go files after edit (`gofmt -w`)
- **go vet**: Runs `go vet ./...` after editing .go files
- **golangci-lint**: Runs linter after editing .go files
- **fmt.Println warning**: Warns about `fmt.Println` / `fmt.Printf` debug statements in edited files

### Stop
- **debug audit**: Checks all modified .go files for debug print statements before session ends
- **go test**: Runs `go test ./...` to verify no regressions

## Auto-Accept Permissions

Use with caution:
- Enable for trusted, well-defined plans
- Disable for exploratory work
- Never use dangerously-skip-permissions flag
- Configure `allowedTools` in `~/.claude.json` instead

## TodoWrite Best Practices

Use TodoWrite tool to:
- Track progress on multi-step tasks
- Verify understanding of instructions
- Enable real-time steering
- Show granular implementation steps

Todo list reveals:
- Out of order steps
- Missing items
- Extra unnecessary items
- Wrong granularity
- Misinterpreted requirements
