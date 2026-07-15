---
name: clean-code-review

description: |
  Review the current module or codebase for clean code, readability, maintainability, and consistency.

  Focus on:
  - naming
  - readability
  - duplication
  - complexity
  - code smells
  - maintainability
  - dead code
  - consistency
  - abstractions

  Suggest improvements but DO NOT modify code automatically.

---

# Clean Code Review Skill

Review the current codebase/module like a senior software engineer focused on maintainability and readability.

## Check For

- poor naming
- duplicated logic
- oversized functions
- dead code
- unnecessary abstractions
- unclear responsibilities
- inconsistent patterns
- deeply nested logic
- hard-to-read code
- magic values
- bad file organization
- weak maintainability

## Important Rules

- NEVER modify code automatically
- ONLY review and suggest improvements
- Prefer simplicity
- Preserve existing architecture
- Avoid overengineering
- Focus on maintainability

## Preferred Coding Practices

Prefer:
- meaningful names
- small focused functions
- modular logic
- readable structure
- consistent conventions
- reusable utilities

Avoid:
- giant functions
- confusing abstractions
- deeply nested conditions
- duplicated code
- clever but unreadable logic

## Output Format

### Code Smell
Describe the issue.

### Why It Matters
Explain maintainability impact.

### Suggested Improvement
Explain better approach.

### Severity
Low / Medium / High

---

After review ask:

"Would you like me to apply any of these clean code improvements?"