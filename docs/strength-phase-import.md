# Strength Phase Import

## Scope
V2 import supports `strength phases` only.

Run and sprint sessions are planned manually in the calendar for now.
Reusable program templates can also be exported to and imported from a dedicated
JSON file from the Programs page. That flow stays separate from the full app
backup export/import.
Saved template cards also provide a one-template export action so a single
reusable program can be shared without exporting the full template library.

## Import Shape
One imported file should describe one reusable strength phase.

The Programs page previews pasted or imported rows as program basics, training
days, blocks, and exercises before saving. The preview does not change the
import format; saving still uses the same row contract below.
The builder also includes a starter example so new templates can begin from a
clear, editable structure.
The builder panel now shows a short checklist to help people start from the
starter example, edit the structure, and save the reusable template.
Saved templates can also be loaded as a copy into a new draft before editing,
which keeps reuse fast without overwriting the original template.
The builder also includes a copy action so the current import text can be
saved elsewhere or reused in another draft.
There is also a reset action that clears the builder back to a blank draft
without touching saved templates.
The builder includes a saved-template picker so an existing template can be
loaded for editing from the same screen, and loading an existing template puts
the cursor in the program name field so editing can begin immediately.
Copied templates are marked with a `Copied` badge, while recently edited
templates keep the `Recently edited` badge.
When the import text is incomplete, the preview shows row-specific hints for
the missing `PROGRAM`, `TRAINING`, `BLOCK`, or `EXERCISE` structure.
The preview also rejects any `BLOCK` that has no `EXERCISE` rows so empty
blocks are caught before saving, and the inline preview renders the failure as
an alert panel instead of a plain paragraph.
The block editor also highlights empty blocks directly with an inline warning
so the missing exercise is visible before preview or save time.
Save-time import failures now use the same red alert styling as the preview
error so the feedback stays visually consistent.
Saved template cards now lead with the phase duration, training-day count, block
count, exercise count, and the first couple of scheduled days so the list is
faster to scan.
When present, the slot notes also show up in that card summary so the day is
easier to recognize at a glance.
Saved templates are shown in most-recently-edited order in both the list and
the builder picker, so the templates people touch most often stay near the top.
The saved-template cards also show a human-readable edit age such as `Edited
today` or `Edited 3 days ago`.
The saved-template list can also be filtered by template name, slot notes, or
exercise text so the builder stays usable as the saved library grows.
The builder now uses nested colored surfaces to separate training days, blocks,
and exercises so the structure is readable at a glance.
The add controls also use stronger palette accents so `Add day`, `Add block`,
and `Add exercise` feel distinct at the level they affect.
The program name and duration fields update the `PROGRAM` row for easier editing.
Training day fields update `TRAINING` rows while preserving the block and exercise
rows that belong to each day.
Block fields update `BLOCK` rows while preserving the exercise rows that belong
to each block.
Exercise fields update `EXERCISE` rows for code, name, reps, notes, and
optional weight.

The parser is order-based. It expects rows in a logical sequence:
- `PROGRAM`
- `TRAINING`
- `BLOCK`
- `EXERCISE`

## Row Types
### PROGRAM
Defines program-level metadata.

```text
PROGRAM,<phase name>,<duration weeks>
```

Example:

```text
PROGRAM,Phase 1,5
```

The `PROGRAM` row requires:
- a non-empty program name
- a duration in weeks
- a positive whole-number duration such as `4` or `12`

### TRAINING
Defines one fixed weekly workout slot.

```text
TRAINING,<weekday>,<session title>,<slot notes optional>
```

Example:

```text
TRAINING,Tuesday,Strength A,Main lower-body day
```

The `TRAINING` row requires:
- a weekday
- a real weekday value such as `Monday`, `Mon`, `Tuesday`, `Tue`, `Friday`, or `Sun`
- an optional title that falls back to `Training #1`, `Training #2`, `Training #3` by order in the program when left empty

### BLOCK
Defines one block inside the current slot.

```text
BLOCK,<label>,<duration with mins>,<rest with s>,<set prescription>
```

Example:

```text
BLOCK,A,15-20 mins,90-120s,3-4
```

### EXERCISE
Defines one exercise inside the current block.

```text
EXERCISE,<code>,<exercise name>,<rep prescription>,<notes>,<weight kg optional>
```

Example:

```text
EXERCISE,A1,Back squat,2x8-10,Heavy,100
```

## Rules
- `BLOCK` must come after a `TRAINING`
- `EXERCISE` must come after a `BLOCK`
- every `BLOCK` must include at least one `EXERCISE`
- only `PROGRAM`, `TRAINING`, `BLOCK`, and `EXERCISE` are accepted row keywords
- legacy `PHASE` and `SLOT` rows are rejected instead of being auto-converted
- `PROGRAM` name is required
- `PROGRAM` duration is required and must be a positive whole number
- `TRAINING` weekday is required and must be a real weekday name or short form like `Mon` or `Fri`
- `TRAINING` title is optional and defaults to `Training #...` by program order when left empty
- weekdays should be written as common names like `Tuesday`, `Fri`, `Sunday`
- block duration should be written like `15 mins` or `15-20 mins`
- block rest should be written like `30s` or `90-120s`
- set prescription can be `3` or a range like `3-4`
- rep prescription is free text and can be values like `10`, `8-10`, `2x10`, or `2x8-10`
- exercise weight is optional and can be left empty if it will be assigned later
- slot notes are optional and are copied into the generated planned session notes
- slot notes can include `Warm Up: 10 mins` or `Warm Up: 10-15 mins`; the Calendar uses that together with block durations and planned rests to show total strength-session time
- after import, the phase becomes a reusable template
- program week 1 starts on the chosen start date and each later week is a rolling 7-day block from that anchor
- saved templates can be loaded back into the phase form, edited, and saved again
- saving a template refreshes its already planned generated sessions while preserving reviewed history
- the actual calendar dates are created when the user chooses a start date in the app

## Example
```text
PROGRAM,Phase 1,5
TRAINING,Tuesday,Strength A,Main lower-body day
BLOCK,A,15-20 mins,90-120s,3-4
EXERCISE,A1,Back squat,2x8-10,Heavy,100
EXERCISE,A2,Barbell row,8-10,Control the eccentric,
BLOCK,B,10 mins,45s,2-3
EXERCISE,B1,Walking lunge,10 each leg,
TRAINING,Friday,Strength B,Upper/lower mixed
BLOCK,A,12 mins,60s,3
EXERCISE,A1,Front squat,2x10,,80
EXERCISE,A2,Pull-up,10,Pause at top,
```
