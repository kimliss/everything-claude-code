# Code Review

Comprehensive security and quality review of uncommitted changes for Go projects:

1. Get changed files: `git diff --name-only HEAD`

2. For each changed file, check for:

**Security Issues (CRITICAL):**
- Hardcoded credentials, API keys, tokens
- SQL injection vulnerabilities (string concatenation in queries)
- Command injection (os/exec with unsanitized input)
- Path traversal risks (filepath operations with user input)
- Missing input validation
- Insecure dependencies (run `go list -m all` and check advisories)
- Race conditions (concurrent access without locks)
- Unsafe package usage without justification
- Missing error checks (especially for I/O operations)
- Weak cryptography (MD5, SHA1 for security purposes)

**Code Quality (HIGH):**
- Functions > 50 lines
- Files > 800 lines
- Nesting depth > 4 levels
- Missing error handling or ignored errors (`_, _ =`)
- Debug print statements (`fmt.Print*`, `log.Print*` without proper logging)
- TODO/FIXME comments without issue references
- Missing godoc comments for exported functions/types
- Non-idiomatic Go patterns
- Naked returns in long functions
- Exported types/functions starting with lowercase

**Go-Specific Issues (HIGH):**
- Goroutine leaks (goroutines without termination conditions)
- Channel deadlocks (unbuffered channels without receivers)
- Mutex not unlocked with defer
- Context not propagated or checked
- Interface pollution (unnecessary interfaces)
- Pointer vs value receiver inconsistency
- Type assertions without ok check
- Range loop variable captured in goroutines
- Deferred calls in loops (resource accumulation)

**Best Practices (MEDIUM):**
- Mutation patterns (prefer immutable where possible)
- Missing tests for new code
- Not using table-driven tests
- Magic numbers without constants
- Global mutable state
- Init() function abuse
- Error messages not lowercase or ending with punctuation
- Package naming (should be short, lowercase, no underscores)

**Performance (MEDIUM):**
- Inefficient string concatenation (use strings.Builder)
- Missing slice pre-allocation
- Unnecessary allocations in hot paths
- N+1 database queries
- Missing connection pooling

3. Generate report with:
   - Severity: CRITICAL, HIGH, MEDIUM, LOW
   - File location and line numbers
   - Issue description
   - Suggested fix with Go-specific examples

4. Block commit if CRITICAL or HIGH issues found

5. Run static analysis:
   ```bash
   go vet ./...
   staticcheck ./...  # if available
   golangci-lint run  # if available
   ```

6. Check for race conditions:
   ```bash
   go test -race ./...
   ```

Never approve code with security vulnerabilities or race conditions!

## Example Issues

### Critical: SQL Injection
```go
// ❌ BAD
query := "SELECT * FROM users WHERE id = " + userID
db.Query(query)

// ✅ GOOD
query := "SELECT * FROM users WHERE id = $1"
db.Query(query, userID)
```

### High: Missing Error Check
```go
// ❌ BAD
data, _ := ioutil.ReadFile(path)

// ✅ GOOD
data, err := ioutil.ReadFile(path)
if err != nil {
    return fmt.Errorf("read file: %w", err)
}
```

### High: Goroutine Leak
```go
// ❌ BAD
go func() {
    for {
        doWork()
    }
}()

// ✅ GOOD
go func() {
    for {
        select {
        case <-ctx.Done():
            return
        default:
            doWork()
        }
    }
}()
```

## Review Checklist

- [ ] All errors are checked and handled
- [ ] No hardcoded secrets or credentials
- [ ] Input validation at system boundaries
- [ ] Context propagation in async operations
- [ ] Goroutines have termination conditions
- [ ] Mutexes unlocked with defer
- [ ] Exported functions have godoc comments
- [ ] Tests cover new functionality
- [ ] No race conditions (verified with -race flag)
- [ ] Error messages follow Go conventions
