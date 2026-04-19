# Strength Phase Import

## Scope
V2 import supports `strength phases` only.

Run and sprint sessions are planned manually in the calendar for now.

## Import Shape
One imported file should describe one reusable strength phase.

The parser is order-based. It expects rows in a logical sequence:
- `PHASE`
- `SLOT`
- `BLOCK`
- `EXERCISE`

## Row Types
### PHASE
Defines phase-level metadata.

```text
PHASE,<phase name>,<duration weeks>
```

Example:

```text
PHASE,Phase 1,5
```

### SLOT
Defines one fixed weekly workout slot.

```text
SLOT,<weekday>,<session title>,<slot notes optional>
```

Example:

```text
SLOT,Tuesday,Strength A,Main lower-body day
```

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
- `BLOCK` must come after a `SLOT`
- `EXERCISE` must come after a `BLOCK`
- weekdays should be written as common names like `Tuesday`, `Fri`, `Sunday`
- block duration should be written like `15 mins` or `15-20 mins`
- block rest should be written like `30s` or `90-120s`
- set prescription can be `3` or a range like `3-4`
- rep prescription is free text and can be values like `10`, `8-10`, `2x10`, or `2x8-10`
- exercise weight is optional and can be left empty if it will be assigned later
- slot notes are optional and are copied into the generated planned session notes
- after import, the phase becomes a reusable template
- saved templates can be loaded back into the phase form, edited, and saved again
- saving a template refreshes its already planned generated sessions while preserving reviewed history
- the actual calendar dates are created when the user chooses a start date in the app

## Example
```text
PHASE,Phase 1,5
SLOT,Tuesday,Strength A,Main lower-body day
BLOCK,A,15-20 mins,90-120s,3-4
EXERCISE,A1,Back squat,2x8-10,Heavy,100
EXERCISE,A2,Barbell row,8-10,Control the eccentric,
BLOCK,B,10 mins,45s,2-3
EXERCISE,B1,Walking lunge,10 each leg,
SLOT,Friday,Strength B,Upper/lower mixed
BLOCK,A,12 mins,60s,3
EXERCISE,A1,Front squat,2x10,,80
EXERCISE,A2,Pull-up,10,Pause at top,
```
