# Performance Optimization

## Model Selection Strategy

**Haiku 4.5** (90% of Sonnet capability, 3x cost savings):
- Lightweight agents with frequent invocation
- Pair programming and code generation
- Worker agents in multi-agent systems

**Sonnet 4.5** (Best coding model):
- Main development work
- Orchestrating multi-agent workflows
- Complex coding tasks

**Opus 4.5** (Deepest reasoning):
- Complex architectural decisions
- Maximum reasoning requirements
- Research and analysis tasks

## Context Window Management

Avoid last 20% of context window for:
- Large-scale refactoring
- Feature implementation spanning multiple files
- Debugging complex interactions

Lower context sensitivity tasks:
- Single-file edits
- Independent utility creation
- Documentation updates
- Simple bug fixes

## Ultrathink + Plan Mode

For complex tasks requiring deep reasoning:
1. Use `ultrathink` for enhanced thinking
2. Enable **Plan Mode** for structured approach
3. "Rev the engine" with multiple critique rounds
4. Use split role sub-agents for diverse analysis

## Go Microservice Performance

### Profiling
- Use `pprof` for CPU and memory profiling
- Use `go test -bench` for benchmarking critical paths
- Profile before optimizing — avoid premature optimization

### Common Optimizations
- Use `sync.Pool` for frequently allocated objects
- Prefer `strings.Builder` over `+` for string concatenation
- Use buffered channels when appropriate
- Set proper `GOMAXPROCS` for container environments
- Use connection pooling for database and HTTP clients

### Database
- Always use prepared statements
- Use connection pool settings (`SetMaxOpenConns`, `SetMaxIdleConns`, `SetConnMaxLifetime`)
- Add proper indexes — use `EXPLAIN` to verify query plans
- Use batch operations for bulk inserts/updates

## Build Troubleshooting

If build fails:
1. Use **build-error-resolver** agent
2. Run `go build ./...` to see all compile errors
3. Run `go vet ./...` for static analysis issues
4. Fix incrementally
5. Verify after each fix with `go test ./...`
