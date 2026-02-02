# Test Coverage

Analyze test coverage and generate missing tests for Go projects:

1. Run tests with coverage: `go test -cover ./...` or `go test -coverprofile=coverage.out ./...`

2. Generate detailed coverage report:
   ```bash
   go test -coverprofile=coverage.out ./...
   go tool cover -html=coverage.out -o coverage.html
   ```

3. Identify packages below 80% coverage threshold:
   ```bash
   go test -cover ./... | grep -v "100.0%"
   ```

4. For each under-covered package:
   - Analyze untested code paths
   - Generate unit tests for functions
   - Generate integration tests for APIs
   - Generate table-driven tests for multiple scenarios
   - Add benchmark tests for performance-critical code

5. Verify new tests pass:
   ```bash
   go test ./... -v
   ```

6. Show before/after coverage metrics:
   ```bash
   go test -cover ./... | grep "coverage:"
   ```

7. Ensure project reaches 80%+ overall coverage

Focus on:
- Happy path scenarios
- Error handling and error returns
- Edge cases (nil, empty slices, zero values)
- Boundary conditions
- Concurrent access patterns
- Context cancellation

## Go-Specific Testing

**Table-Driven Tests:**
```go
func TestCalculate(t *testing.T) {
    tests := []struct {
        name    string
        input   int
        want    int
        wantErr bool
    }{
        {"positive", 5, 10, false},
        {"zero", 0, 0, false},
        {"negative", -5, 0, true},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := Calculate(tt.input)
            if (err != nil) != tt.wantErr {
                t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
            }
            if got != tt.want {
                t.Errorf("got %v, want %v", got, tt.want)
            }
        })
    }
}
```

**Benchmark Tests:**
```go
func BenchmarkCalculate(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Calculate(100)
    }
}
```

## Coverage Goals

- **80% minimum** for all packages
- **100% required** for:
  - Financial calculations
  - Authentication logic
  - Security-critical code
  - Core business logic

## Commands Reference

```bash
# Basic coverage
go test -cover ./...

# Detailed coverage profile
go test -coverprofile=coverage.out ./...

# HTML coverage report
go tool cover -html=coverage.out

# Coverage by function
go tool cover -func=coverage.out

# Coverage for specific package
go test -cover ./internal/auth

# Show uncovered lines
go test -coverprofile=coverage.out ./... && \
go tool cover -func=coverage.out | grep -v "100.0%"
```
