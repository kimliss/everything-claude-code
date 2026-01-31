# Common Patterns

## API Response Format

```go
type Response struct {
    Code    int         `json:"code"`
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
}

type PaginatedResponse struct {
    Code    int         `json:"code"`
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
    Meta    *PageMeta   `json:"meta,omitempty"`
}

type PageMeta struct {
    Total   int64 `json:"total"`
    Page    int   `json:"page"`
    PerPage int   `json:"per_page"`
}
```

## Repository Pattern

```go
type UserRepository interface {
    FindAll(ctx context.Context, filter UserFilter) ([]*User, int64, error)
    FindByID(ctx context.Context, id string) (*User, error)
    Create(ctx context.Context, user *User) error
    Update(ctx context.Context, user *User) error
    Delete(ctx context.Context, id string) error
}

type userRepository struct {
    db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
    return &userRepository{db: db}
}
```

## Service Layer Pattern

```go
type UserService interface {
    GetUser(ctx context.Context, id string) (*User, error)
    CreateUser(ctx context.Context, req *CreateUserRequest) (*User, error)
}

type userService struct {
    repo   UserRepository
    cache  Cache
    logger *slog.Logger
}

func NewUserService(repo UserRepository, cache Cache, logger *slog.Logger) UserService {
    return &userService{repo: repo, cache: cache, logger: logger}
}
```

## Middleware Pattern

```go
func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        token := r.Header.Get("Authorization")
        if token == "" {
            http.Error(w, "unauthorized", http.StatusUnauthorized)
            return
        }
        claims, err := validateToken(token)
        if err != nil {
            http.Error(w, "invalid token", http.StatusUnauthorized)
            return
        }
        ctx := context.WithValue(r.Context(), userClaimsKey, claims)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

## Dependency Injection (Constructor Injection)

```go
// Wire dependencies via constructors, not globals
func main() {
    db := initDB()
    cache := initCache()
    logger := slog.Default()

    userRepo := user.NewRepository(db)
    userSvc := user.NewService(userRepo, cache, logger)
    userHandler := user.NewHandler(userSvc, logger)

    router := setupRouter(userHandler)
    // ...
}
```

## Graceful Shutdown

```go
func main() {
    srv := &http.Server{Addr: ":8080", Handler: router}

    go func() {
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("listen: %v", err)
        }
    }()

    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    if err := srv.Shutdown(ctx); err != nil {
        log.Fatalf("server shutdown: %v", err)
    }
}
```

## Skeleton Projects

When implementing new functionality:
1. Search for battle-tested skeleton projects (e.g., go-kit, go-micro templates)
2. Use parallel agents to evaluate options:
   - Security assessment
   - Extensibility analysis
   - Relevance scoring
   - Implementation planning
3. Clone best match as foundation
4. Iterate within proven structure
