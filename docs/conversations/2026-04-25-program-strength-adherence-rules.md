# Program Strength Adherence Rules

This note records the working rules agreed during the Program Strength Progress adherence update.

## UI Change

Program Strength Progress no longer uses the `Program Weekly Adherence` stacked bar chart.

The adherence area now shows `Training Day Completion`:

- one row per generated strength training day in the selected program
- rows grouped by `phaseSlotId`
- visible labels based on the generated session title, such as `Training #1`, `Training #2`, and `Training #3`
- rows sorted by phase slot order / first occurrence order
- count text such as `4/5 completed`
- one segmented line per row, with one segment per scheduled repetition of that training day

Status colors:

- `completed` and `modified` count as completed and render green
- `planned` and `missed` count as not completed and render grey

The global Stats adherence summary and the Program Strength Progress completion doughnut remain unchanged.

## Ongoing Agent Rules

For future change sets:

- include a suggested commit message at the end of the final response
- update the relevant README or documentation when code or UI behavior changes
- keep documentation aligned with the implemented behavior, not just the requested behavior
