# Coding Style

## Go Idioms (CRITICAL)

Follow Go conventions and idioms strictly:

```go
// WRONG: Ignoring errors
result, _ := riskyOperation()

// CORRECT: Always handle errors
result, err := riskyOperation()
if err != nil {
    return fmt.Errorf("risky operation failed: %w", err)
}
```

## Naming Conventions

- Package names: short, lowercase, no underscores (`userservice`, not `user_service`)
- Exported names: PascalCase (`GetUser`, `UserService`)
- Unexported names: camelCase (`getUserFromDB`, `defaultTimeout`)
- Interfaces: describe behavior, use `-er` suffix when possible (`Reader`, `Handler`, `Validator`)
- Avoid stuttering: `user.Service` not `user.UserService`

## File Organization

MANY SMALL FILES > FEW LARGE FILES:
- High cohesion, low coupling
- 200-400 lines typical, 800 max
- One struct + methods per file when reasonable
- Organize by domain/feature, not by layer

```
service/
├── user/
│   ├── handler.go       # HTTP handlers
│   ├── service.go       # Business logic
│   ├── repository.go    # Data access
│   ├── model.go         # Domain models
│   └── user_test.go     # Tests
├── order/
│   ├── handler.go
│   ├── service.go
│   └── ...
```

## Error Handling

ALWAYS wrap errors with context:

```go
func (s *UserService) GetUser(ctx context.Context, id string) (*User, error) {
    user, err := s.repo.FindByID(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("get user %s: %w", id, err)
    }
    if user == nil {
        return nil, ErrUserNotFound
    }
    return user, nil
}
```

Define sentinel errors for known error cases:

```go
var (
    ErrUserNotFound  = errors.New("user not found")
    ErrInvalidInput  = errors.New("invalid input")
    ErrUnauthorized  = errors.New("unauthorized")
)
```

## Input Validation

ALWAYS validate input at service boundaries (HTTP handlers, gRPC interceptors):

```go
func (h *Handler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        respondError(w, http.StatusBadRequest, "invalid request body")
        return
    }
    if err := req.Validate(); err != nil {
        respondError(w, http.StatusBadRequest, err.Error())
        return
    }
    // ...
}

func (r *CreateUserRequest) Validate() error {
    if r.Email == "" {
        return fmt.Errorf("email is required")
    }
    if r.Name == "" {
        return fmt.Errorf("name is required")
    }
    return nil
}
```

## Code Quality Checklist

Before marking work complete:
- [ ] Code follows Go idioms (effective Go, code review comments)
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels) — use early returns
- [ ] Errors are wrapped with context (`fmt.Errorf("...: %w", err)`)
- [ ] No `fmt.Println` or debug logging left behind
- [ ] No hardcoded values (use config or constants)
- [ ] `go vet` and `golangci-lint` pass
- [ ] Interfaces are small and focused (1-3 methods)
- [ ] Context propagation is correct (`context.Context` as first param)
