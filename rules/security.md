# Security Guidelines

## Mandatory Security Checks

Before ANY commit:
- [ ] No hardcoded secrets (API keys, passwords, tokens, DSNs)
- [ ] All user inputs validated at service boundaries
- [ ] SQL injection prevention (parameterized queries, never string concat)
- [ ] Proper authentication/authorization on all endpoints
- [ ] Rate limiting on public-facing endpoints
- [ ] Error messages don't leak sensitive data (stack traces, internal paths)
- [ ] Context timeout set for all external calls
- [ ] TLS configured for inter-service communication

## Secret Management

```go
// NEVER: Hardcoded secrets
const dbDSN = "postgres://admin:password@localhost/mydb"

// ALWAYS: Environment variables or config
func loadConfig() (*Config, error) {
    dsn := os.Getenv("DATABASE_DSN")
    if dsn == "" {
        return nil, fmt.Errorf("DATABASE_DSN is required")
    }
    return &Config{DatabaseDSN: dsn}, nil
}
```

## SQL Injection Prevention

```go
// NEVER: String concatenation
query := "SELECT * FROM users WHERE id = '" + userID + "'"

// ALWAYS: Parameterized queries
row := db.QueryRowContext(ctx, "SELECT * FROM users WHERE id = $1", userID)
```

## Microservice Security

- Validate JWT/tokens in middleware, not in handlers
- Use mTLS for service-to-service communication
- Apply principle of least privilege for service accounts
- Log security events with structured logging (`slog`)
- Set timeouts on all HTTP clients and servers
- Never trust input from other services — always validate

```go
// HTTP client with timeout
client := &http.Client{
    Timeout: 10 * time.Second,
}

// HTTP server with timeouts
srv := &http.Server{
    ReadTimeout:  5 * time.Second,
    WriteTimeout: 10 * time.Second,
    IdleTimeout:  120 * time.Second,
}
```

## Security Response Protocol

If security issue found:
1. STOP immediately
2. Use **security-reviewer** agent
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets
5. Review entire codebase for similar issues
