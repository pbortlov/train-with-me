# Product Principles

## Simple First
The default experience must be understandable for non-technical users. The main flow should be:
- see this week
- see what is planned
- mark what was done
- review adherence

## Geek / Coach Mode
Advanced planning controls may exist, but they should be hidden behind an explicit `Geek / coach mode` toggle.

Use coach mode for:
- raw import content
- richer planning metadata
- advanced review details
- future program design controls

## Calendar First
V2 is centered on planning before logging. The app should answer:
- what is planned this week?
- what was completed?
- what changed?

## Document Every Meaningful Decision
If a change affects product behavior, architecture, workflow, or data semantics, it must be recorded in the repo.

The minimum documentation path is:
- `README.md` for user-visible capability changes
- `docs/decisions/` for important product or architecture decisions
- `docs/conversations/` for planning summaries that led to those decisions

## Runnable Incremental Delivery
Work should land in coherent vertical slices. Each slice should be:
- runnable
- targeted-tested
- documented in the same change
