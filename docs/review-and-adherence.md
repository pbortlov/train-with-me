# Review And Adherence

## Planned Vs Actual
V2 keeps the difference between plan and reality visible.

### Run
Review compares:
- planned distance
- planned target pace
- actual distance
- actual time
- actual pace
- modification note if changed

Run actual pace is calculated automatically from logged distance and logged time.

### Sprint
Review compares:
- planned sprint blocks
- actual sprint sets
- session feeling
- modification note if changed

### Strength
Review compares:
- planned blocks
- planned exercises inside each block
- actual per-set execution per exercise
- actual load type, reps, weight, or band color for each logged set
- completed or skipped exercises
- per-exercise notes

Strength completion status uses minimum planned targets:
- planned reps like `10`, `8-10`, `2x10`, and `2x8-10` use the minimum rep target
- planned sets like `3` and `3-4` use the minimum set target
- logged reps below the minimum target mark the session as modified
- logged sets below the minimum target mark the session as modified
- extra reps, extra sets, or heavier weight still count as completed
- empty planned weight means the first logged kg, bodyweight, or band load becomes progress data, not a modification
- planned weight requires actual kg load to meet or exceed the planned target
- skipped exercises or changed structure still mark the session as modified

Saved completed/modified strength sessions are recalculated on app load and after backup import so Review and adherence use the current status rules.

Completed or modified planned sessions can be edited from the Calendar training view. Editing updates the planned session actual data, recalculates completed vs modified status, and syncs the linked workout record so Review, Stats, and Program Strength Progress use the corrected values.

Program adherence charts display completed and modified sessions together as `Done` because both count toward adherence. Review still shows modified sessions separately so plan changes remain visible.

## Program Strength Progress
Program progress is strength-only for now.

The program duration comes from the scheduled strength phase instance, not from a fixed week count. A four-week phase shows Week 1 to Week 4, while a six-week phase shows Week 1 to Week 6.

Program Strength Progress compares:
- overall program completion as a doughnut chart with `completed + modified` as green and `planned + missed` as grey
- weekly strength adherence inside the selected phase instance
- completed, modified, missed, and still-planned generated strength sessions
- exercise progression by program week
- top weight, max reps, completed sets, and logged set summaries

Exercise progress rows can be sorted by:
- `Program order`: the first planned session/block/exercise position
- `Highest improvement`: strongest latest improvement compared with the previous logged week
- `Needs attention`: below-previous, missing-latest, or frequently unlogged exercises first

Run and sprint sessions are not attached to strength phases yet. They remain progress-over-time metrics on the Stats page.

## Run And Sprint Goals
Run and sprint goals are stored with the date they were set. When a goal is achieved, the achieved date and linked workout are saved in goal history so the app can show how long the goal took.

Run goals can be:
- distance-only, such as `10 km`
- pace-only, such as below `5:00/km`
- combined distance plus time, such as `5 km under 22:00`

Combined run goals require both conditions: the logged run must meet or exceed the target distance and finish at or below the target time. A faster pace over a shorter run does not count.

Sprint goals are distance-specific. For example, a `100 m under 14.2 sec` goal can only be achieved by a logged 100 m sprint set at or below 14.2 seconds.

Run and sprint charts show active and achieved goal targets when the chart metric matches the goal. Achieved goals are marked with a celebration marker on the qualifying chart point. Strength goals are not drawn on the general strength chart because strength progress will use a separate program-specific metric.

## Adherence
Weekly adherence is defined as:

`completed sessions / planned sessions`

For example:
- `5/6` means five completed or modified planned sessions out of six planned sessions in the week

## Status Meanings
- `planned`: not yet completed
- `completed`: auto-detected when logged workout matches the plan closely enough
- `modified`: auto-detected when the logged workout differs from the plan
- `missed`: explicitly missed

Modified sessions count toward weekly adherence but stay marked as modified in review.
