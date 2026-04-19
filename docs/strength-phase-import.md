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
BLOCK,<label>,<duration minutes or range>,<rest seconds>,<planned sets>
```

Example:

```text
BLOCK,A,15-20,60,3
```

### EXERCISE
Defines one exercise inside the current block.

```text
EXERCISE,<code>,<exercise name>,<reps>,<notes>,<weight kg optional>
```

Example:

```text
EXERCISE,A1,Back squat,5,Heavy,100
```

## Rules
- `BLOCK` must come after a `SLOT`
- `EXERCISE` must come after a `BLOCK`
- weekdays should be written as common names like `Tuesday`, `Fri`, `Sunday`
- block duration can be a single value like `15` or a range like `15-20`
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
BLOCK,A,15-20,60,3
EXERCISE,A1,Back squat,5,Heavy,100
EXERCISE,A2,Barbell row,8,Control the eccentric,
BLOCK,B,10,45,2
EXERCISE,B1,Walking lunge,10 each leg,
SLOT,Friday,Strength B,Upper/lower mixed
BLOCK,A,12,60,4
EXERCISE,A1,Front squat,4,,80
EXERCISE,A2,Pull-up,6,Pause at top,
```
