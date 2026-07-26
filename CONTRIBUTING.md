# Contributing

This project uses small, manually tested MVPs. Keep V1 single-user,
local-first, and deployable on GitHub Pages.

## Development Rules

- Inspect the current branch, working tree, relevant docs, and implementation
  before changing files.
- Before editing, report the current branch, dirty-tree risks, and relevant
  architecture.
- Pull remote `main` before creating a branch for a new MVP, after confirming
  the previous PR was merged.
- Use one branch per MVP or bugfix unless the user explicitly asks to continue
  on the current branch.
- Use meaningful branch names, such as `mvp/stats-improvement-feed`,
  `bugfix/calendar-session-details`, or `docs/project-workflow`.
- Implement only one MVP or bugfix at a time.
- Stop after each change and wait for manual testing confirmation.
- Do not create commits for the user. Provide exact `git add` and `git commit`
  commands instead.
- Use one exact Conventional Commit message for each completed change.
- Never revert or overwrite unrelated working-tree changes.

## Product And Compatibility Rules

- Preserve existing `localStorage` data and backup compatibility.
- Do not add a backend, authentication, cloud sync, or external account
  integration unless explicitly approved.
- Keep user-facing workflow changes documented in `README.md` or relevant docs.
- Create an ADR for architecture, deployment, storage-contract,
  metric-semantic, or major product decisions.
- Do not include local computer filesystem paths in repository documentation.

## Validation

Run feasible targeted tests for the change, then run:

```bash
npm run build
```

For manual testing, start a production preview with:

```bash
npm run build & npm run preview -- --host 127.0.0.1
```

When a command fails in an agent response, show it clearly:

```html
<span style="color:red"><strong>FAILED:</strong> command and reason</span>
```

## Definition Of Done

- Branch was created from updated `main`.
- Change is one coherent MVP or bugfix.
- Relevant tests and `npm run build` passed, or failures are clearly reported.
- Preview was started for manual testing when app behavior changed.
- Manual testing steps are precise and reproducible.
- Docs or ADRs were updated when workflow, behavior, storage, metrics, or
  architecture changed.
- Final response lists files to commit and exact commit commands.

## Pull Requests

After the user commits:

1. Verify the branch and clean working tree.
2. Push the current branch.
3. Open a PR against `main`.
4. Use the PR template sections: Summary, Why, Validation, Manual Testing,
   Compatibility Impact, and Docs/ADR Checklist.

