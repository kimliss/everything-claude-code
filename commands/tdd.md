---
description: Enforce test-driven development workflow. Scaffold interfaces, generate tests FIRST, then implement minimal code to pass. Ensure 80%+ coverage.
---

# TDD Command

This command invokes the **tdd-guide** agent to enforce test-driven development methodology for Go projects.

## What This Command Does

1. **Scaffold Interfaces** - Define types/interfaces first
2. **Generate Tests First** - Write failing tests (RED)
3. **Implement Minimal Code** - Write just enough to pass (GREEN)
4. **Refactor** - Improve code while keeping tests green (REFACTOR)
5. **Verify Coverage** - Ensure 80%+ test coverage

## When to Use

Use `/tdd` when:
- Implementing new features
- Adding new functions/packages
- Fixing bugs (write test that reproduces bug first)
- Refactoring existing code
- Building critical business logic

## How It Works

The tdd-guide agent will:

1. **Define interfaces** for inputs/outputs
2. **Write tests that will FAIL** (because code doesn't exist yet)
3. **Run tests** and verify they fail for the right reason
4. **Write minimal implementation** to make tests pass
5. **Run tests** and verify they pass
6. **Refactor** code while keeping tests green
7. **Check coverage** and add more tests if below 80%

## TDD Cycle

```
RED → GREEN → REFACTOR → REPEAT

RED:      Write a failing test
GREEN:    Write minimal code to pass
REFACTOR: Improve code, keep tests passing
REPEAT:   Next feature/scenario
```

## Example Usage

```
User: /tdd I need a function to calculate market liquidity score

Agent (tdd-guide):
# TDD Session: Market Liquidity Score Calculator

## Step 1: Define Interface (SCAFFOLD)

```go
// internal/liquidity/liquidity.go
package liquidity

import "time"

// MarketData represents market data for liquidity calculation
type MarketData struct {
    TotalVolume   float64
    BidAskSpread  float64
    ActiveTraders int
    LastTradeTime time.Time
}

// CalculateLiquidityScore computes a liquidity score (0-100) for a market
func CalculateLiquidityScore(market MarketData) float64 {
    // TODO: Implementation
    panic("not implemented")
}
```

## Step 2: Write Failing Test (RED)

```go
// internal/liquidity/liquidity_test.go
package liquidity_test

import (
    "testing"
    "time"

    "yourproject/internal/liquidity"
)

func TestCalculateLiquidityScore_HighLiquidity(t *testing.T) {
    market := liquidity.MarketData{
        TotalVolume:   100000,
        BidAskSpread:  0.01,
        ActiveTraders: 500,
        LastTradeTime: time.Now(),
    }

    score := liquidity.CalculateLiquidityScore(market)

    if score <= 80 {
        t.Errorf("Expected high liquidity score > 80, got %.2f", score)
    }
    if score > 100 {
        t.Errorf("Expected score <= 100, got %.2f", score)
    }
}

func TestCalculateLiquidityScore_LowLiquidity(t *testing.T) {
    market := liquidity.MarketData{
        TotalVolume:   100,
        BidAskSpread:  0.5,
        ActiveTraders: 2,
        LastTradeTime: time.Now().Add(-24 * time.Hour), // 1 day ago
    }

    score := liquidity.CalculateLiquidityScore(market)

    if score >= 30 {
        t.Errorf("Expected low liquidity score < 30, got %.2f", score)
    }
    if score < 0 {
        t.Errorf("Expected score >= 0, got %.2f", score)
    }
}

func TestCalculateLiquidityScore_ZeroVolume(t *testing.T) {
    market := liquidity.MarketData{
        TotalVolume:   0,
        BidAskSpread:  0,
        ActiveTraders: 0,
        LastTradeTime: time.Now(),
    }

    score := liquidity.CalculateLiquidityScore(market)

    if score != 0 {
        t.Errorf("Expected score 0 for zero volume, got %.2f", score)
    }
}
```

## Step 3: Run Tests - Verify FAIL

```bash
go test ./internal/liquidity/...

--- FAIL: TestCalculateLiquidityScore_HighLiquidity (0.00s)
panic: not implemented

FAIL    yourproject/internal/liquidity  0.001s
```

✅ Tests fail as expected. Ready to implement.

## Step 4: Implement Minimal Code (GREEN)

```go
// internal/liquidity/liquidity.go
package liquidity

import (
    "math"
    "time"
)

// CalculateLiquidityScore computes a liquidity score (0-100) for a market
func CalculateLiquidityScore(market MarketData) float64 {
    // Handle zero volume edge case
    if market.TotalVolume == 0 {
        return 0
    }

    // Calculate component scores (0-100 scale)
    volumeScore := math.Min(market.TotalVolume/1000, 100)
    spreadScore := math.Max(100-(market.BidAskSpread*1000), 0)
    traderScore := math.Min(float64(market.ActiveTraders)/10, 100)

    // Recent activity bonus
    hoursSinceLastTrade := time.Since(market.LastTradeTime).Hours()
    recencyScore := math.Max(100-(hoursSinceLastTrade*10), 0)

    // Weighted average
    score := volumeScore*0.4 +
        spreadScore*0.3 +
        traderScore*0.2 +
        recencyScore*0.1

    // Clamp to 0-100
    return clamp(score, 0, 100)
}

func clamp(value, min, max float64) float64 {
    if value < min {
        return min
    }
    if value > max {
        return max
    }
    return value
}
```

## Step 5: Run Tests - Verify PASS

```bash
go test ./internal/liquidity/... -v

=== RUN   TestCalculateLiquidityScore_HighLiquidity
--- PASS: TestCalculateLiquidityScore_HighLiquidity (0.00s)
=== RUN   TestCalculateLiquidityScore_LowLiquidity
--- PASS: TestCalculateLiquidityScore_LowLiquidity (0.00s)
=== RUN   TestCalculateLiquidityScore_ZeroVolume
--- PASS: TestCalculateLiquidityScore_ZeroVolume (0.00s)
PASS
ok      yourproject/internal/liquidity  0.002s
```

✅ All tests passing!

## Step 6: Refactor (IMPROVE)

```go
// internal/liquidity/liquidity.go - Refactored with constants
package liquidity

import (
    "math"
    "time"
)

const (
    // Weights for different liquidity factors
    volumeWeight  = 0.4
    spreadWeight  = 0.3
    traderWeight  = 0.2
    recencyWeight = 0.1
)

const (
    // Scale factors for normalization
    volumeScaleFactor  = 1000.0
    spreadScaleFactor  = 1000.0
    traderScaleFactor  = 10.0
    recencyPenaltyRate = 10.0
)

// CalculateLiquidityScore computes a liquidity score (0-100) for a market
func CalculateLiquidityScore(market MarketData) float64 {
    if market.TotalVolume == 0 {
        return 0
    }

    volumeScore := normalizeVolume(market.TotalVolume)
    spreadScore := normalizeSpread(market.BidAskSpread)
    traderScore := normalizeTraders(market.ActiveTraders)
    recencyScore := normalizeRecency(market.LastTradeTime)

    weightedScore := volumeScore*volumeWeight +
        spreadScore*spreadWeight +
        traderScore*traderWeight +
        recencyScore*recencyWeight

    return clamp(weightedScore, 0, 100)
}

func normalizeVolume(volume float64) float64 {
    return math.Min(volume/volumeScaleFactor, 100)
}

func normalizeSpread(spread float64) float64 {
    return clamp(100-(spread*spreadScaleFactor), 0, 100)
}

func normalizeTraders(traders int) float64 {
    return math.Min(float64(traders)/traderScaleFactor, 100)
}

func normalizeRecency(lastTrade time.Time) float64 {
    hoursSince := time.Since(lastTrade).Hours()
    return clamp(100-(hoursSince*recencyPenaltyRate), 0, 100)
}

func clamp(value, min, max float64) float64 {
    if value < min {
        return min
    }
    if value > max {
        return max
    }
    return value
}
```

## Step 7: Verify Tests Still Pass

```bash
go test ./internal/liquidity/... -v

=== RUN   TestCalculateLiquidityScore_HighLiquidity
--- PASS: TestCalculateLiquidityScore_HighLiquidity (0.00s)
=== RUN   TestCalculateLiquidityScore_LowLiquidity
--- PASS: TestCalculateLiquidityScore_LowLiquidity (0.00s)
=== RUN   TestCalculateLiquidityScore_ZeroVolume
--- PASS: TestCalculateLiquidityScore_ZeroVolume (0.00s)
PASS
ok      yourproject/internal/liquidity  0.002s
```

✅ Refactoring complete, tests still passing!

## Step 8: Check Coverage

```bash
go test ./internal/liquidity/... -cover

ok      yourproject/internal/liquidity  0.002s  coverage: 100.0% of statements

Coverage: 100% ✅ (Target: 80%)
```

✅ TDD session complete!
```

## TDD Best Practices

**DO:**
- ✅ Write the test FIRST, before any implementation
- ✅ Run tests and verify they FAIL before implementing
- ✅ Write minimal code to make tests pass
- ✅ Refactor only after tests are green
- ✅ Add edge cases and error scenarios
- ✅ Aim for 80%+ coverage (100% for critical code)

**DON'T:**
- ❌ Write implementation before tests
- ❌ Skip running tests after each change
- ❌ Write too much code at once
- ❌ Ignore failing tests
- ❌ Test implementation details (test behavior)
- ❌ Over-mock (prefer table-driven tests)

## Test Types to Include

**Unit Tests** (Function-level):
- Happy path scenarios
- Edge cases (empty, nil, max values)
- Error conditions
- Boundary values

**Integration Tests** (Package-level):
- API endpoints
- Database operations
- External service calls
- Concurrent operations

**Benchmark Tests** (use `/go-test` command):
- Performance-critical functions
- Data structure operations
- Algorithm comparisons

## Coverage Requirements

- **80% minimum** for all code
- **100% required** for:
  - Financial calculations
  - Authentication logic
  - Security-critical code
  - Core business logic

## Important Notes

**MANDATORY**: Tests must be written BEFORE implementation. The TDD cycle is:

1. **RED** - Write failing test
2. **GREEN** - Implement to pass
3. **REFACTOR** - Improve code

Never skip the RED phase. Never write code before tests.

## Integration with Other Commands

- Use `/plan` first to understand what to build
- Use `/tdd` to implement with tests
- Use `/go-build` if build errors occur
- Use `/go-review` to review implementation
- Use `/go-test` for advanced testing (benchmarks, fuzzing)

## Related Agents

This command invokes the `tdd-guide` agent located at:
`~/.claude/agents/tdd-guide.md`

And can reference the `golang-testing` skill at:
`~/.claude/skills/golang-testing/`
