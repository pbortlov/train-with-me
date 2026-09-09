# 0032 - Confirm Strength Set Drafts Before Saving

- Date: 2026-09-09
- Status: accepted

## Context

Compact entry makes it easy to start a set and then correct the numbers. The
app must not mistake an abandoned or prefilled row for performed work.

## Decision

New strength set rows start as transient drafts. The athlete confirms each row
before adding the exercise; only confirmed rows are persisted and used by
progression, achievements, goals, and history. A draft can be removed without
affecting saved data. The existing storage shape is unchanged, so all legacy
saved/imported sets continue to mean completed work.

The next-target action is deliberately a convenience: it copies the pending
suggestion into the next-set inputs. The athlete still adds and confirms the
actual performed set, and applying it never changes the saved working target or
program prescription.

## Consequences

The logger clearly distinguishes Draft and Confirmed rows, while the domain
continues to receive the existing completed-set shape. There is no migration or
backup-version change. A user who leaves drafts behind cannot create false
progress, but must confirm rows before adding an exercise.
