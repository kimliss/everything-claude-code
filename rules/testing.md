# Testing Requirements

## Minimum Test Coverage: 80%

Test Types (ALL required):
1. **Unit Tests** - Individual functions, services, repositories
2. **Integration Tests** - API endpoints, database operations, service interactions
3. **E2E Tests** - Critical API flows, multi-service scenarios

## Test-Driven Development

MANDATORY workflow:
1. Write test first (RED)
2. Run test - it should FAIL
3. Write minimal implementation (GREEN)
4. Run test - it should PASS
5. Refactor (IMPROVE)
6. Verify coverage (`go test -cover ./...` 80%+)

## Go Testing Patterns

### Table-Driven Tests

```go
func TestGetUser(t *testing.T) {
    tests := []struct {
        name    string
        id      string
        want    *User
        wantErr error
    }{
        {
            name:    "existing user",
            id:      "user-1",
            want:    &User{ID: "user-1", Name: "Alice"},
            wantErr: nil,
        },
        {
            name:    "not found",
            id:      "unknown",
            want:    nil,
            wantErr: ErrUserNotFound,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            svc := NewUserService(mockRepo)
            got, err := svc.GetUser(context.Background(), tt.id)
            if !errors.Is(err, tt.wantErr) {
                t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
            }
            if !reflect.DeepEqual(got, tt.want) {
                t.Errorf("got = %v, want %v", got, tt.want)
            }
        })
    }
}
```

### Interface-Based Mocking

```go
// Define interface for dependencies
type UserRepository interface {
    FindByID(ctx context.Context, id string) (*User, error)
}

// Mock implementation for tests
type mockUserRepo struct {
    users map[string]*User
}

func (m *mockUserRepo) FindByID(ctx context.Context, id string) (*User, error) {
    if u, ok := m.users[id]; ok {
        return u, nil
    }
    return nil, ErrUserNotFound
}
```

### HTTP Handler Tests

```go
func TestCreateUserHandler(t *testing.T) {
    body := `{"name":"Alice","email":"alice@example.com"}`
    req := httptest.NewRequest(http.MethodPost, "/users", strings.NewReader(body))
    req.Header.Set("Content-Type", "application/json")
    rec := httptest.NewRecorder()

    handler := NewHandler(mockService)
    handler.CreateUser(rec, req)

    if rec.Code != http.StatusCreated {
        t.Errorf("status = %d, want %d", rec.Code, http.StatusCreated)
    }
}
```

### Integration Tests with testcontainers

```go
func TestUserRepository_Integration(t *testing.T) {
    if testing.Short() {
        t.Skip("skipping integration test")
    }
    // Use testcontainers-go to spin up PostgreSQL
    // Run actual DB queries
    // Verify results
}
```

## Troubleshooting Test Failures

1. Use **tdd-guide** agent
2. Check test isolation (no shared state between tests)
3. Verify mocks/stubs return correct values
4. Use `t.Parallel()` carefully — avoid shared resources
5. Fix implementation, not tests (unless tests are wrong)

## Agent Support

- **tdd-guide** - Use PROACTIVELY for new features, enforces write-tests-first
- **e2e-runner** - API integration testing specialist
