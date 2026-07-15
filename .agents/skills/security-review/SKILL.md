---
name: performance-review

description: |
  Review the current module or codebase for performance bottlenecks and scalability issues.

  Focus on:
  - database efficiency
  - async handling
  - memory usage
  - expensive operations
  - API response performance
  - caching opportunities
  - query optimization
  - unnecessary computations

  Suggest improvements but DO NOT modify code automatically.

---

# Performance Review Skill

Review the current codebase/module like a senior performance engineer.

## Check For

- N+1 query problems
- unnecessary DB queries
- blocking operations
- poor async handling
- expensive loops
- memory waste
- large payloads
- missing pagination
- repeated computations
- unnecessary API calls
- missing caching opportunities
- inefficient SQL queries

## Important Rules

- NEVER modify code automatically
- ONLY review and suggest improvements
- Focus on practical bottlenecks
- Avoid premature optimization
- Explain measurable impact

## Preferred Performance Practices

Prefer:
- efficient queries
- pagination
- batching
- proper indexing
- async operations
- caching where useful
- optimized payloads

Avoid:
- micro-optimizations
- unnecessary complexity
- premature caching
- deeply nested loops
- duplicate DB access

## Output Format

### Performance Issue
Describe the bottleneck.

### Impact
Explain performance/scalability impact.

### Suggested Improvement
Explain optimization approach.

### Severity
Low / Medium / High

---

After review ask:

"Would you like me to apply any of these performance improvements?"