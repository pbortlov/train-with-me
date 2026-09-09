# Athlete Simplification Project: PR Roadmap

- Updated: 2026-09-09
- Project status: active; R01 in progress
- Implementation progress: 0 of 11 steps delivered
- Next implementation: R01 — compact strength logger
- Baseline: [PR #69](https://github.com/pbortlov/train-with-me/pull/69), merged
- Scope: the athlete doing strength, running, and sprinting
- Product agreement: [decision record](../conversations/2026-09-09-athlete-simplification.md)
- Architecture/product direction: [ADR 0030](../decisions/0030-athlete-simplification-direction.md)

## What happens next

R00 is merged in [PR #70](https://github.com/pbortlov/train-with-me/pull/70).
The first implementation is **R01: simplify strength logging**.
Finish, test, and review one PR before starting
the next. The final flow is Today → start/repeat → record actual work → save →
review improvements and the next target.

R00–R11 are planning labels, not GitHub PR numbers. Add each real PR link to the
table when opened, and mark it delivered only after merge. The accepted product
decisions are fixed; this ordering and the proposed PR titles are the delivery plan.

## Delivery sequence

| Order | Proposed PR title | Athlete outcome | Depends on | Status / GitHub PR |
| --- | --- | --- | --- | --- |
| R00 | `docs: record athlete simplification roadmap` | Agreements and next steps are recorded | Merged #69 | Merged — [#70](https://github.com/pbortlov/train-with-me/pull/70) |
| R01 | `refactor(logging): simplify strength exercise cards` | See last work, next suggestion, and set entry first | R00 | In progress |
| R02 | `feat(logging): confirm draft sets and apply suggested targets` | Confirm actual sets; explicitly apply a suggestion to a draft | R01 | Planned |
| R03 | `feat(strength): preserve progress on shortened workouts` | Select hurting exercises; celebrate unaffected completed work | R02 | Planned |
| R04 | `feat(today): start and repeat workouts` | Start today's plan or repeat previous training | R03 | Planned |
| R05 | `feat(goals): track exercise weight and rep goals` | Achieve a specific strength goal in one working set | R03; deliver after R04 | Planned |
| R06 | `feat(progress): summarize workout achievements after saving` | One summary of improvements and achieved goals | R04, R05 | Planned |
| R07 | `refactor(progress): unify activity and exercise review` | Find history, targets, and trends in one relevant view | R06 | Planned |
| R08 | `refactor(plan): combine calendar and program management` | See the week and active program before builder controls | R04; deliver after R07 | Planned |
| R09 | `refactor(navigation): add today plan progress and settings` | Three main tabs with clear settings and history access | R07, R08 | Planned |
| R10 | `feat(settings): choose training activities on first use` | Choose strength, running, and/or sprinting | R09 | Planned |
| R11 | `feat(settings): suggest hiding inactive activities` | Optional reminders after 30 inactive days | R10 | Planned |
| Close | `docs: close and archive athlete simplification project` | Completed delivery and final validation are recorded | R01–R11 and final product check | Planned |

The original seven broad items are split into eleven implementation PRs to keep
draft completion, exercise eligibility, goals, and reminder timing independently
testable. No app changes are included in R00.

## Project tracking and completion

Treat this roadmap as one finite project. Keep it in `docs/roadmaps/` while
active, updating each implementation row through **Planned → In progress → PR
open → Delivered**. Attach the real PR link when available and mark Delivered
only after merge and the step's validation. Keep the header's delivered count
and next step in sync; R00 and the closing documentation PR are not part of the
eleven implementation steps.

The project is ready to close when:

- R01–R11 are merged and their acceptance checks and manual reviews are complete.
- The final product check below is recorded with results and any limitations.
- No unresolved issue prevents an agreed user flow from working.
- README, behavior documentation, ADR implementation status, and applicable
  backup contracts describe what was actually delivered.

Do not silently drop unfinished work to close the project. If the athlete
explicitly agrees to defer a step or requirement, record the reason and a linked
follow-up issue or roadmap item. Distinguish deferred work from delivered work
in both the table and the final completion summary.

## Closing PR and archive policy

Use one final documentation PR to close the project after the conditions above
are met:

1. Record the completion date, implementation PR links, final validation results,
   and any explicitly agreed deferrals in this roadmap.
2. Mark the project **Completed**, and move this file to
   `docs/roadmaps/archive/athlete-simplification.md`. Preserve its decision and
   delivery history rather than deleting it.
3. Update all incoming links and this file's relative links for its new location.
   Remove the README's next-iteration promotion; keep a historical documentation
   link if useful. Update the product-principles next-iteration wording as well.
4. Keep the conversation record and ADRs in their existing directories. Update
   pending implementation statuses and cross-references to reflect delivery;
   preserve historical decisions and mark superseded rules explicitly.
5. Verify documentation links and run the required build. Link the closing PR
   in the project record. Archiving takes effect when that PR merges.

Create the archive directory during closeout, not while implementation is still
pending. Subsequent features and bugfixes belong in separate work items; this
completed roadmap remains a historical record.

## R01 — Compact strength logger (delivered in PR #72)

Show exercise name and setup summary, exact previous sets, the saved-target/next-
session summary, and current set entry. Collapse setup and target controls behind
**Edit setup** and **Edit target**. Put jump configuration under **Weight increments**.
Keep active context visible; new exercises can expose initial setup.

Acceptance checks:

- An existing exercise can be logged without opening either editor.
- Variation/equipment/load type remain visible; changing setup selects the right
  history and profile. No existing comparison rules change in this slice.
- A pending suggestion is clearly labeled; the saved working baseline remains
  inspectable. Keyboard and phone layouts support entering and correcting sets.

Docs: update logging guidance and README. Reference ADR 0030's disclosure decision
and ADR 0031 for the implemented layout choice.

## R02 — Confirm actual sets and apply suggestions (in progress)

Introduce an explicit draft/completed distinction for strength set rows. Add
**Apply suggested target**, which fills the intended draft target while keeping
actual-set confirmation separate. This works in the logger before repeat is added.

Acceptance checks:

- Prefilled/unconfirmed rows cannot update targets, goals, progress, or completed
  history. Saving reports actual confirmed work; an empty draft is not a workout.
- Applying a suggestion does not change already confirmed sets, the saved working
  weight, or a program prescription. Changing a confirmed set requires explicit
  handling so edited draft values are not silently treated as performed work.
- Existing saved workouts retain their completed meaning, including after import.

Docs: record draft/confirmation semantics and update ADR 0027 for the draft action.
Document any persistence changes and their legacy behavior before shipping.

## R03 — Progress when finishing with fewer sets

Add **Finish with fewer sets** and let the athlete select exercises that were
hurting. Exclude affected exercises, preserve all actual logs, and keep unaffected
completed work eligible. Apply one consistent rule across the logger, comparable
recall, target updates, Stats, and achievement inputs.

Acceptance checks:

- In one workout, mark squat as hurting and finish bench press normally: squat
  history remains; eligible bench work still progresses and can raise its target.
- Finish bench with 2 of 3 sets, including a heavier set meeting minimum reps:
  the saved weight can increase. Missing target sets still prevent a calculated
  top-range suggestion. Finishing early must not manufacture completed sets.
- An explicitly unfinished exercise is distinct from **Finish with fewer sets**.
  A wholly affected session, deload, technique session, and program prescription
  retain their applicable restrictions.
- Legacy session-wide pain/incomplete flags keep their prior meaning. Save,
  reopen, edit, and backup/restore retain exercise-specific context correctly.

Docs: update ADRs 0028/0029, the MVP record, and the backup contract. Include the
completed-work/eligibility matrix in domain tests. No pain coaching is introduced.

## R04 — Start and repeat from Today

Lead with **Start today's workout** when scheduled. Otherwise offer **Repeat last
workout** when history exists and **Log workout** for a new athlete. Always allow
a different workout. Make onboarding dismissible and keep help accessible.

Acceptance checks:

- A strength repeat copies exercises, setup, and previous numbers into unconfirmed
  rows. It starts with previous weights even when a higher suggestion exists.
- Repeat does not carry over completion, pain flags, or program linkage as new
  facts. Starting a scheduled workout preserves its prescription and linkage.
- Run/sprint repeats use activity-appropriate drafts and require confirmation of
  actual performance. Returning to Today shows the saved session correctly.
- No-history, no-plan, scheduled-session, and repeat-with-suggestion paths work.

Docs: update Today/logging guidance; record repeat and onboarding behavior.

## R05 — Specific goals with compatible migration

Add strength goals for an exercise, kg, and reps. One eligible completed working
set can achieve the goal. Keep running distance/time and sprint distance/time
goals. Keep goal achievement distinct from the next-workout target.

Acceptance checks:

- A matching eligible set meeting both weight and rep thresholds achieves the
  strength goal; the wrong exercise/setup, insufficient reps or load, warm-up,
  unconfirmed work, and pain-affected exercise do not.
- An unaffected exercise can achieve a goal in a workout finished with fewer sets.
- Old generic kg goals remain saved and can be explicitly associated with an
  exercise and reps. No exercise or achievement is silently inferred.
- Running/sprint boundary and distance matching behavior remains compatible.
  Repeated saves do not duplicate achievements; edits and restores remain valid.

Docs: add/update goal semantics ADR and backup contract. Define matching against
the existing exercise identity and retain original goal history during migration.

## R06 — One summary after saving

Present improvements, achieved goals, and target changes in one compact summary
with **View details**. Use concrete wording such as **One more set at 32.5 kg**.
Include the qualifying work behind an achievement when details are opened.

Acceptance checks:

- Multiple achievements from one save yield one summary rather than competing
  popups. No improvement gets neutral saved-workout feedback.
- A difficult day can show an unaffected exercise's improvement alongside the
  recorded discomfort context; excluded work earns no automatic achievement.
- Draft edits do not trigger celebrations. Details preserve exact logged sets,
  exercise identity, and the distinction between suggestions and target updates.

Docs: update ADR 0029 and goal-celebration documentation.

## R07 — One Progress destination

Lead with recent improvements and offer Strength, Running, and Sprint views. For
strength, place history, current target, pending suggestion, and trends on the
relevant exercise page. Keep detailed charts, program comparisons, and review
available on demand. Consolidate overlapping summary sections.

Acceptance checks:

- Find the last session and next suggestion from one exercise view, including
  exercises with history but no saved target.
- Historical pain-affected, non-kg, and program work stays accessible and labeled;
  sharing a page does not combine unlike records into comparable evidence.
- Run/sprint filters and detailed analytics remain usable; empty-history states
  explain how to begin. Full history, editing, and deletion remain discoverable.

Docs: update Stats/review ADRs and README. Preserve existing metric definitions.

## R08 — Plan and Manage programs

Bring the week calendar and active program into one Plan destination. Place
creation, templates, import/export, and advanced program controls under **Manage
programs**, with a clear return to the week.

Acceptance checks:

- Starting, moving, and completing sessions works from the new layout.
- Cascading move previews, original program-week identity, manual shifts, and
  template refresh behavior are preserved.
- The builder, templates, and imports remain reachable and usable; no active
  program gets a useful week view and an obvious setup route.

Docs: update planner overview and navigation/program ADRs.

## R09 — Three tabs and Settings

Finish the navigation as **Today · Plan · Progress**. Move backup, import/export,
preferences, and help into Settings. Workout history lives in Progress. Move
dismissed onboarding/help access into Settings as part of this transition.

Acceptance checks:

- Legacy saved views and existing shortcuts open the appropriate destination
  after refresh or restore. Every former main-page capability remains reachable.
- Backup/restore, exercise-library management, history editing, and installation
  help are discoverable; phone navigation and keyboard focus behave correctly.

Docs: update navigation ADRs, README, planner overview, and view-state migration notes.

## R10 — Activity selection

Ask **What do you train?** on first use, with editable Strength, Running, and Sprint
selections. Offer the same controls in Settings and filter everyday options.

Acceptance checks:

- A strength-only choice focuses logging, planning, and Progress on strength.
- Existing run/sprint history and scheduled sessions remain accessible; enabling
  an activity again restores its options without data loss.
- Older installations do not suddenly lose activities. Persisted preferences
  survive refresh and backup/restore, with safe defaults for missing fields.

Docs: record preference/onboarding semantics and update the backup contract.

## R11 — Optional 30-day inactivity suggestions

For an enabled activity with no logged session for 30 days and no upcoming planned
session, offer to hide it. Require explicit confirmation. Dismissal starts a
30-day cooldown for that activity.

Acceptance checks:

- Before 30 days: no prompt. At the threshold with no upcoming plan: eligible.
  An upcoming plan suppresses the prompt; hidden activities are not prompted.
- Dismissal persists and prevents another prompt until 30 more days have elapsed.
  Confirmation hides options while preserving history and scheduled sessions.
- Use deterministic time-based tests. An enabled but never-used activity starts
  its observation window at onboarding/enabling, not at an invented workout date.
  Re-enabling starts a fresh window; no immediate repeated nagging.
- Show reminders only while using the app, without requiring background jobs or
  push notifications. Define date boundaries explicitly in the implementing ADR.

Docs: record timing, cooldown, and persistence rules. The never-used/re-enabled
window above is the proposed implementation default for the agreed 30-day rule.

## Required checks for every implementation PR

- One working athlete flow, with acceptance checks and reproducible manual steps.
- Focused domain/integration tests for changed meaning or persistence. Check
  browser interactions, keyboard use, and phone layout for UI changes.
- `npm run build`; production smoke check when the app bundle or shell changes.
- Update README/workflow docs and the relevant ADR whenever behavior changes.
- For stored-data changes: old/malformed data, edit/reopen, and backup round trips;
  follow the consumer-verification requirements in the backup contract.
- Review manually, let the user commit, then push/open the PR using the repository
  template. Record its link and merge status here before moving on.

No estimated dates are committed. Size and acceptance results determine when the
next slice starts. Avoid combining the whole roadmap into one large PR.

## Final product check

Compare the current app with the delivered flow using the same tasks: start a
familiar workout, change one set, finish with fewer sets and select a hurting
exercise, find the next suggestion, review a goal, move a session, and export a
backup. Record completion time, taps, mistakes, and hesitation. Improvements are
to be measured through these tasks, not assumed from the number of removed fields.
