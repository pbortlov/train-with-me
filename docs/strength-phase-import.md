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
SLOT,<weekday>,<session title>
```

Example:

```text
SLOT,Tuesday,Strength A
```

### BLOCK
Defines one block inside the current slot.

```text
BLOCK,<label>,<duration minutes>,<rest seconds>,<planned sets>
```

Example:

```text
BLOCK,A,15,60,3
```

### EXERCISE
Defines one exercise inside the current block.

```text
EXERCISE,<code>,<exercise name>,<reps>,<notes>
```

Example:

```text
EXERCISE,A1,Back squat,5,Heavy
```

## Rules
- `BLOCK` must come after a `SLOT`
- `EXERCISE` must come after a `BLOCK`
- weekdays should be written as common names like `Tuesday`, `Fri`, `Sunday`
- after import, the phase becomes a reusable template
- the actual calendar dates are created when the user chooses a start date in the app

## Example
```text
PHASE,Phase 1,5
SLOT,Tuesday,Strength A
BLOCK,A,15,60,3
EXERCISE,A1,Back squat,5,Heavy
EXERCISE,A2,Barbell row,8,
BLOCK,B,10,45,2
EXERCISE,B1,Walking lunge,10 each leg,
SLOT,Friday,Strength B
BLOCK,A,12,60,4
EXERCISE,A1,Front squat,4,
EXERCISE,A2,Pull-up,6,
```
