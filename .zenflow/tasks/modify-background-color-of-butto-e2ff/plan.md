# Quick Change with Auto-PR

## Configuration

**Artifacts Path**: {@artifacts_path}

**Description**: Streamlined Quick Change workflow with automatic PR creation and notification when complete.

---

### [ ] Step: Load Configuration

Load project environment variables for workflow automation.

**Objectives**:
- Check for `.env` file in project root
- Load all environment variables that start with `ZENFLOW_`
- Store them for use in subsequent steps
- Log clear messages about configuration status

**Behavior**:
- If `.env` file not found: Log message "No .env file found in project root. Continuing without environment configuration."
- If `.env` exists but no `ZENFLOW_*` variables: Log message "No ZENFLOW_* environment variables found in .env file. Automation features may be limited."
- If `ZENFLOW_*` variables loaded: Log success message with count of variables loaded

**Acceptance Criteria**:
- Configuration loading attempted
- Clear logging provided to developer
- Workflow continues regardless of configuration state

**Artifacts**: Create `{@artifacts_path}/config.md` documenting loaded variables (without exposing sensitive values).

---

### [ ] Step: Implementation

Complete the task implementation according to requirements.

**Objectives**:
- Implement all required functionality
- Follow project coding standards (2-space indentation, explicit TypeScript typing, no `any` types)
- Test appropriately based on scope and complexity of changes
- Update documentation if needed

**Testing Guidelines**:
- Use your judgment to determine appropriate testing level
- For simple changes (styling, small tweaks): Basic verification is sufficient
- For logic changes or new features: Write relevant unit tests
- Don't feel obligated to run full integration/e2e test suites unless the change warrants it

**Acceptance Criteria**:
- Code follows project standards from `agent_rules.md`
- Appropriate testing for the scope of changes
- Module `docs.md` updated if functionality changed

**Artifacts**: Create `{@artifacts_path}/implementation-report.md` documenting what was implemented.

---

### [ ] Step: Create PR For Review

Create GitHub pull request and send notification via ntfy.

**Objectives**:
- Create PR using GitHub MCP tools
- Send push notification if configured
- Provide developer with PR link and status

**GitHub PR Creation**:

MCP Tool: `create_pull_request`

Parameters:
- `owner`: Repository owner username
- `repo`: Repository name  
- `title`: "Task: [task-name]"
- `body`: Summary from implementation report
- `head`: Current worktree branch
- `base`: "main" (or configured base branch)

**DO NOT ask for permission** - execute automatically.

**Notification via ntfy**:

MCP Tool: `send_ntfy`

Parameters:
- `topic`: Value from `ZENFLOW_PROJECT_TOPIC` environment variable
- `title`: "New PR: [mm/dd/yy] - [project_name] - [PR title]"
  - Use current date in mm/dd/yy format
  - Use the repository/project name
  - Include the actual PR title
  - Example: "New PR: 01/20/26 - zenflow-app - Task: Update button colors"
- `message`: Brief description of changes from implementation report
- `priority`: "high"
- `click_url`: GitHub PR URL
- `tags`: ["github", "pull-request", "[project_name]"]
  - Include the repository/project name as a tag for filtering
  - Example: ["github", "pull-request", "zenflow-app"]

Behavior:
- If `ZENFLOW_PROJECT_TOPIC` is set: Send notification automatically
- If `ZENFLOW_PROJECT_TOPIC` is not set: Skip notification and inform developer in chat with message: "Notification skipped - ZENFLOW_PROJECT_TOPIC environment variable not found in .env file."

**DO NOT ask for permission** - execute automatically when topic is configured.

**Acceptance Criteria**:
- PR created successfully on GitHub
- Notification sent (if configured) or skip reason communicated
- Developer provided with PR link

**Artifacts**: Create `{@artifacts_path}/pr-summary.md` with PR URL, title, description, and notification status.
