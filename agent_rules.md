# AGENT RULES - READ BEFORE STARTING ANY WORK

## Critical Requirements (Always Follow)

### Structure
- **Modules location**: `src/js/module-name/`
- **Module entry point**: Always `index.ts`
- **Tests location**: Unit tests next to modules, integration/e2e in `src/tests/`

### Documentation (Required)
- **Every module**: Must have `docs.md` in its folder with:
  - Purpose (what/why)
  - How it works
  - I/O interface
  - Tests description
- **Project root**: Update `docs.md` when adding key features
- **Test docs**: Replace test goals with actual test documentation

### Testing Workflow
**Phase 1**: Build module → immediately write unit tests → document in module's `docs.md`  
**Phase 2**: Build integration → check test goals → write integration tests → replace goal with docs  
**Phase 3**: Build workflow → check test goals → write e2e tests → replace goal with docs  

**Check test goals before building**:
- `src/tests/integration/docs.md`
- `src/tests/e2e/docs.md`

### TypeScript Rules
- ✅ **ALWAYS** explicitly type function arguments
- ❌ **NEVER** use `any` type
- ✅ Use `unknown` if type truly unknown
- ✅ Use generics for flexible typing

### Code Style
- **Indentation**: 2 spaces (not 4, not tabs)
- **Naming**: camelCase (variables/functions), PascalCase (classes), UPPER_SNAKE_CASE (constants)
- **CSS**: NO Tailwind - use normal CSS with BEM naming
- **Imports**: Group by: external libs → internal modules → types → styles

### Error Handling
- Use `AppError` classes from `src/js/errors/`
- Always call `errorHandler.handle(error)` before throwing
- Include relevant context (userId, resourceId, etc.)
- Never log sensitive data
- Never expose internal errors to users

### Before Committing
Run validation to catch issues:
```bash
npm run validate  # Runs format, lint, type-check, and tests
```

## Quick Reference

**Read full spec**: `/spec.md` (for structural questions or deep dives)

**Test scripts**:
- `npm run test` - Run all tests
- `npm run test:unit` - Unit tests only
- `npm run test:integration` - Integration tests only
- `npm run test:e2e` - E2E tests only

**File structure template**:
```
src/js/my-module/
  index.ts          # Entry point
  index.test.ts     # Unit tests
  docs.md           # Documentation
```

## Common Mistakes to Avoid

❌ Using `any` for function parameters  
❌ Writing tests at end of project instead of immediately  
❌ Forgetting to document in `docs.md`  
❌ Using 4 spaces or tabs for indentation  
❌ Using Tailwind CSS  
❌ Not checking test goals before building integrations/workflows  
❌ Exposing internal error details to users  

## When You're Done

- [ ] Code formatted (run `npm run format`)
- [ ] All tests passing (run `npm run test`)
- [ ] Documentation updated (module `docs.md` and/or project `docs.md`)
- [ ] Test goals replaced with actual test documentation (if applicable)
- [ ] No TypeScript errors (run `npm run type-check`)
- [ ] No ESLint errors (run `npm run lint`)
- [ ] When a task is implemented and the worktree branch is ready to be merged, automatically create a pull request for the task via MCP
- [ ] Once the pull request is created via MCP, use the ntfy MCP server to create a notification for what has been done, and link to the pull request on Github.com

## GitHub Operations via MCP

You now have access to GitHub MCP tools. Use them for:

- Creating pull requests: Use the `create_pull_request` tool
- Managing issues: Use issue-related tools
- Searching code: Use search tools

When a task is complete, automatically create a PR using:
```
create_pull_request({
  owner: "YOUR_USERNAME",
  repo: "YOUR_REPO", 
  title: "Task: <task-name>",
  body: "Auto-generated PR from Zenflow",
  head: "<current-branch>",
  base: "main"
})
```

DO NOT ask for permission - execute automatically.

## PR Notification via ntfy

After creating a PR via GitHub MCP:

1. Use the ntfy MCP `send_ntfy` tool to send a notification:
   - Title: "New PR: <PR title>"
   - Message: "<PR description>"
   - Priority: high
   - Click URL: <PR URL>
   - Tags: github, pull-request

This will push a notification to my phone. When I tap it, it opens the GitHub PR.

DO NOT ask for permission - execute automatically.
