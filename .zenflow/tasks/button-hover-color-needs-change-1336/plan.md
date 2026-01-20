# Quick Change with Auto-PR

## Configuration

**Artifacts Path**: {@artifacts_path}

**Description**: Streamlined Quick Change workflow with automatic PR creation and notification when complete.

---

### [x] Step: Load Configuration
<!-- chat-id: 9afdbdb0-e91b-4fd3-9c19-00049ae17e69 -->

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

### [x] Step: Implementation
<!-- chat-id: e849110e-1ffb-4369-8454-780319a63940 -->

Complete the task implementation according to requirements.

**Objectives**:
- Implement all required functionality
- Follow project coding standards (2-space indentation, explicit TypeScript typing, no `any` types)
- Write unit tests alongside implementation
- Update module documentation

**Acceptance Criteria**:
- Code follows project standards from `agent_rules.md`
- Unit tests written and passing
- Module `docs.md` updated if applicable
- TypeScript properly typed with no `any` usage

**Artifacts**: Create `{@artifacts_path}/implementation-report.md` documenting what was implemented.

---

### [x] Step: Create Pull Request
<!-- chat-id: ddeef8de-96d9-4cde-9fd5-889ffa7f3833 -->

Automatically create a pull request via GitHub MCP.

**Objectives**:
- Use GitHub MCP tools to create PR
- Auto-generate title and description from implementation
- Link current branch to target branch

**MCP Tool**: `create_pull_request`

**Parameters**:
- `owner`: Repository owner username
- `repo`: Repository name  
- `title`: "Task: [task-name]"
- `body`: Summary from implementation report
- `head`: Current worktree branch
- `base`: "main" (or configured base branch)

**DO NOT ask for permission** - execute automatically.

**Acceptance Criteria**:
- PR created successfully on GitHub
- PR URL captured for notification step

**Artifacts**: Create `{@artifacts_path}/pr-details.md` with PR URL, title, and description.

---

### [x] Step: Send Review Notification
<!-- chat-id: 8d730c6e-8a14-44a8-9ac0-0ee45cbb5bc0 -->

Send push notification via ntfy MCP server about the new PR.

**Objectives**:
- Notify developer that PR is ready for review
- Include PR link for quick access
- Use project-specific topic if configured

**MCP Tool**: `send_ntfy`

**Parameters**:
- `topic`: Value from `ZENFLOW_PROJECT_TOPIC` environment variable
- `title`: "New PR: [PR title]"
- `message`: Brief description of changes from implementation report
- `priority`: "high"
- `click_url`: GitHub PR URL from previous step
- `tags`: ["github", "pull-request"]

**Behavior**:
- If `ZENFLOW_PROJECT_TOPIC` is not set: Skip notification and inform developer in chat with message: "Notification skipped - ZENFLOW_PROJECT_TOPIC environment variable not found in .env file."
- If variable is set: Send notification automatically

**DO NOT ask for permission** - execute automatically when topic is configured.

**Acceptance Criteria**:
- If topic configured: Notification sent successfully
- If topic missing: Developer informed via chat message
- Notification status documented

**Artifacts**: Update `{@artifacts_path}/pr-details.md` with notification status.

---

### [ ] Step: Task Complete

Finalize the workflow and mark task as complete.

**Objectives**:
- Mark the task as Done in Zenflow
- Provide summary of completed work
- Confirm all workflow steps executed

**Summary includes**:
- Implementation overview
- PR link: [URL from pr-details.md]
- Configuration status
- Notification status
- Any notes or follow-up items

**Instructions**:
- Mark this task as Done in Zenflow's task management system

**Artifacts**: Create `{@artifacts_path}/summary.md` with complete workflow results.
