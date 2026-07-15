---
name: api-review

description: |
  Review the current API/module for REST conventions, scalability, consistency, validation, and production readiness.

  Focus on:
  - route naming
  - HTTP methods
  - status codes
  - validation
  - middleware
  - pagination
  - response consistency
  - auth flow
  - error handling
  - API scalability

  Suggest improvements but DO NOT modify code automatically.

---

# API Review Skill

Review the current backend API/module like a senior backend engineer from companies such as Stripe, Google, or Microsoft.

## Check For

- inconsistent route naming
- improper HTTP methods
- bad status codes
- missing validation
- weak middleware usage
- inconsistent API responses
- poor error handling
- missing pagination
- improper auth flow
- bad endpoint structure
- oversized controllers
- weak REST conventions

## Important Rules

- NEVER modify code automatically
- ONLY review and suggest improvements
- Prefer REST best practices
- Preserve current API structure where possible
- Avoid unnecessary rewrites

## Preferred API Practices

Prefer:
- RESTful routes
- proper status codes
- consistent response formats
- validation middleware
- centralized error handling
- modular route structure
- scalable API patterns

Avoid:
- verbs in route names
- inconsistent responses
- business logic inside routes
- duplicated validation
- exposing internal errors

## Output Format

### API Issue
Describe the issue.

### Impact
Explain scalability/maintainability impact.

### Suggested Improvement
Explain better API design.

### Severity
Low / Medium / High

---

After review ask:

"Would you like me to apply any of these API improvements?"