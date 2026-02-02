# Update Documentation

Sync documentation from source-of-truth for Go projects:

1. Read go.mod for project dependencies
   - Generate dependencies table
   - Document Go version requirements
   - List direct and indirect dependencies

2. Read Makefile or task files
   - Generate available commands reference
   - Document build, test, and deployment targets
   - Include descriptions from comments

3. Read environment variables from:
   - config/config.go or similar configuration files
   - docker-compose.yml
   - deployment manifests
   - Extract all environment variables
   - Document purpose, format, and default values

4. Generate docs/CONTRIBUTING.md with:
   - Development workflow
   - Available make targets
   - Environment setup (Go version, tools required)
   - Testing procedures (`go test`, `go vet`, `golangci-lint`)
   - Code review checklist

5. Generate docs/DEPLOYMENT.md with:
   - Build instructions (`go build`, Docker build)
   - Deployment procedures
   - Configuration management
   - Health checks and monitoring
   - Rollback procedures

6. Generate docs/API.md if applicable:
   - Extract HTTP handlers/routes
   - Document request/response formats
   - Authentication requirements
   - Rate limiting

7. Identify obsolete documentation:
   - Find docs not modified in 90+ days
   - Cross-reference with recent code changes
   - List for manual review

8. Show diff summary

## Single Sources of Truth

For Go projects:
- **go.mod** - Dependencies and Go version
- **Makefile** - Build and operational commands
- **config/** - Environment variables and configuration
- **cmd/** - Main entry points and CLI commands
- **internal/handlers/** or **api/** - HTTP endpoints

## Example Documentation Structure

```
docs/
├── CONTRIBUTING.md    # Development guide
├── DEPLOYMENT.md      # Deployment procedures
├── API.md             # API documentation
├── ARCHITECTURE.md    # System design
└── RUNBOOK.md         # Operations guide
```

## Go-Specific Documentation

### Dependencies (from go.mod)
```markdown
## Dependencies

- Go 1.21+
- github.com/gin-gonic/gin v1.9.1
- github.com/lib/pq v1.10.9 (PostgreSQL driver)
```

### Make Targets (from Makefile)
```markdown
## Available Commands

- `make build` - Build the application
- `make test` - Run all tests
- `make lint` - Run golangci-lint
- `make docker` - Build Docker image
```

### Environment Variables
```markdown
## Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| PORT | int | 8080 | HTTP server port |
| DB_URL | string | required | PostgreSQL connection string |
| LOG_LEVEL | string | info | Logging level (debug/info/warn/error) |
```

## Automation

Run this command to keep docs in sync:
```bash
make docs  # or equivalent documentation generation command
```
