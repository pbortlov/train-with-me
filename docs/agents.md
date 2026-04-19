# Agent Catalog

This project uses a small set of reusable planning/implementation agents so future work stays consistent and recoverable.

## Core Rule
All agents should respect the project principle:
- default UX must stay simple for non-technical users
- advanced behavior belongs behind geek / coach mode

## Agents

### Product Planner Agent
- Purpose: define feature direction and success criteria
- Use for: scope shaping, feature tradeoffs, planner semantics
- Outputs: implementation-ready product decisions

### Information Architect Agent
- Purpose: own page structure and navigation
- Use for: deciding what belongs on Calendar, Phases, Review, Stats
- Outputs: page architecture, responsive structure

### Calendar Planner Agent
- Purpose: own planning workflows and weekly calendar UX
- Use for: planned session creation, week view interactions, statuses
- Outputs: calendar interaction model and scheduling behavior

### Strength Phase Import Agent
- Purpose: own spreadsheet import contract and strength phase generation
- Use for: parser rules, import validation, template scheduling
- Outputs: import spec and reusable phase logic

### Review And Adherence Agent
- Purpose: own planned-vs-actual comparison and adherence meaning
- Use for: completion rules, modified vs completed behavior, review surfaces
- Outputs: review semantics and adherence calculations

### Statistics Agent
- Purpose: own planner-centric metrics and summaries
- Use for: weekly completion summaries, adherence trend reporting, planner KPIs
- Outputs: metric definitions and chart recommendations

### Documentation Steward Agent
- Purpose: keep implementation, README, decisions, and conversations synchronized
- Use for: every meaningful feature or architecture change
- Outputs: updated documentation and traceable project history
