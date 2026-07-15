---
name: architecture-review

description: |
  Review the architecture of the current module or codebase.

  Focus on:
  - scalability
  - separation of concerns
  - modularity
  - dependency management
  - folder structure
  - service boundaries
  - controller/service/repository separation
  - reusability
  - coupling
  - cohesion

  Suggest improvements but DO NOT modify code automatically.

---

# Architecture Review Skill

Review the current module, feature, or codebase like a senior staff engineer from Google, Microsoft, or Stripe.

## Check For

- scalability problems
- poor modularity
- bad folder structure
- tightly coupled code
- oversized controllers/services
- improper separation of concerns
- repeated business logic
- dependency issues
- maintainability problems
- weak service boundaries

## Important Rules

- NEVER modify code automatically
- ONLY review and suggest improvements
- Explain WHY something is problematic
- Prefer practical improvements
- Avoid overengineering
- Preserve existing project conventions

## Preferred Architecture

Prefer:
- controller → service → repository pattern
- modular code
- reusable components
- scalable folder structures
- low coupling
- high cohesion

Avoid:
- business logic inside controllers
- SQL inside routes/controllers
- giant files
- tightly coupled modules
- duplicated logic

## Output Format

Use this structure:

### Issue
Describe the issue.

### Impact
Explain why it matters.

### Suggested Improvement
Explain the better approach.

### Severity
Low / Medium / High

---

After review ask:

"Would you like me to apply any of these improvements?"