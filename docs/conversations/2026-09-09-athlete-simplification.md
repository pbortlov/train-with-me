# Athlete Simplification: Agreed Product Decisions

- Recorded: 2026-09-09
- Status: product decisions agreed; implementation pending
- Baseline: [strength progression MVP, PR #69](https://github.com/pbortlov/train-with-me/pull/69), merged
- Delivery plan: [PR roadmap](../roadmaps/athlete-simplification.md)
- Decision record: [ADR 0030](../decisions/0030-athlete-simplification-direction.md)

This records the final answers from the product discussion. It describes the
next iteration, not functionality already delivered by PR #69. Where an earlier
answer was revised, the final choice below takes precedence.

## Audience and everyday flow

The primary user is the athlete doing strength, running, and sprinting. Advanced
planning remains available when needed. The main flow is:

1. Open Today.
2. Start a scheduled workout, or repeat a previous workout when nothing is planned.
3. Confirm the work actually completed.
4. Save and see improvements, achieved goals, and the next useful target.

Logging a different workout remains available. A new athlete without a previous
workout gets a clear logging action rather than an unusable repeat button.

## Logging, repetition, and targets

- Use a compact strength exercise card: exercise/setup summary, exact previous
  working sets, target/suggestion summary, and editable current set rows.
- Keep variation, equipment, and load type visible as a summary. Open their
  controls through **Edit setup**. New exercises expose setup when needed.
- Open working weight, target set count, and rep range through **Edit target**.
  Permitted weight jumps belong under **Weight increments** within target editing.
- Repeat last workout creates an editable draft with the previous exercises and
  numbers. Each copied strength set requires confirmation before it counts as
  completed. Copying never creates a completed workout by itself.
- A repeat starts with previous weights. **Apply suggested target** explicitly
  changes the draft; it does not confirm sets or change the saved working target.
- Show the next-session suggestion prominently and explain the saved working
  baseline on demand. Keep the existing post-save heavier-set and top-range
  rules from ADR 0027, including heavier completed work taking precedence.
- Program prescriptions retain authority over generic recommendations.

## Finishing early and discomfort: final choice

The athlete wants to celebrate progress even on difficult days. The earlier
proposal to exclude an entire session whenever it ends early was rejected.

- Offer **Finish with fewer sets**. Fewer sets alone do not disqualify completed
  work from progress, goal achievement, or a qualifying heavier-set target update.
- Let the athlete select which exercises were hurting or affected by discomfort.
  Preserve their actual logged work, but exclude those exercises from automatic
  progression and strength-goal achievement.
- Unaffected completed exercises in the same workout remain eligible for
  progression, target updates, and celebrations.
- Copied/unconfirmed sets are not completed work. An explicitly unfinished
  exercise stays distinguishable from one intentionally finished with fewer sets.
- A calculated top-range next-weight suggestion still needs the full target
  number of qualifying sets. Finishing with fewer sets does not relax that rule.
- Keep discomfort easy to record; deload, technique, and optional effort can
  sit under **Session details**, with active context visible in the summary.
- Retain session-wide exclusions when context really affects the whole workout.
  Existing deload, technique, and program rules are not being relaxed.

Exercise selection is part of the agreed next iteration, not a deferred feature.
Per-set pain location/severity, rehabilitation, and other coaching features remain
outside this roadmap.

## Navigation and review

- Main tabs: **Today · Plan · Progress**.
- Settings contains backup, import/export, installation help, and preferences.
- Plan opens on the week calendar and active program. Creation, saved templates,
  and imports are available through **Manage programs**.
- Progress leads with recent improvements, then Strength, Running, and Sprint
  views. Detailed history and charts open from the relevant exercise or activity.
- Keep history accessible, including records that are excluded from comparisons.
- After saving, show one compact summary of improvements and achieved goals,
  with **View details**. Avoid multiple competing celebration popups.

## Activities and inactivity reminders

- Ask **What do you train?** on first use: Strength, Running, and Sprint.
  Selections can be changed later in Settings.
- Selecting an activity determines which logging, planning, and progress options
  are offered. Hiding it never deletes its history or hides existing scheduled
  sessions; athletes can still access the history and re-enable the activity.
- After 30 days without a logged session of an enabled activity, offer a
  dismissible suggestion to hide it, provided it has no upcoming planned sessions.
- Require confirmation to hide an activity. Never disable it automatically.
- Dismissing the suggestion delays another prompt for that activity by 30 days.

## Goals

- Strength goals specify an exercise, weight, and reps, such as **Bench press
  80 kg × 8 reps**. One qualifying completed working set achieves the goal.
- Warm-ups and work from an exercise marked as hurting do not achieve strength
  goals. Completed, unaffected work can achieve a goal on a shortened day.
- Sprint goals pair a specific distance with a target time, such as **30 m in
  4.2 seconds or less**.
- Running goals pair distance with target time, such as **5 km in 25 minutes or
  less**. Preserve the existing compatible run/sprint goal behavior.
- Preserve legacy generic strength goals. The implementation must provide an
  explicit way to choose their exercise and reps; never infer those from kg alone.

## Delivery boundary

The user requested a written decision record and roadmap first. This change is
documentation only. Implement the roadmap as small functional PRs, validate each
changed flow, update the relevant ADRs/docs, and stop for athlete review between
slices. Future GitHub PR numbers are assigned only when those PRs are opened.

## Project lifecycle agreement

Treat the roadmap as a finite project. Track each step's actual PR and completion
status. Once the implementation and final validation are complete, close the
project through a documentation PR and archive the roadmap under
`docs/roadmaps/archive/` instead of deleting it. Remove its active/next-iteration
promotion from README and update links. Retain ADRs and this decision record,
updating implementation status where appropriate. Any deliberately deferred work
requires an explicit recorded agreement and a follow-up reference.

R01 is now in progress on the compact strength logger. Its first implementation
keeps setup and target summaries visible while moving their editing controls into
on-demand disclosures. Set confirmation, repeat drafts, and exercise-level
discomfort remain in the later roadmap steps.
