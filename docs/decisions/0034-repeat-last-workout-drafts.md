# 0034 - Repeat Last Strength Workout as Drafts

- Date: 2026-09-10
- Status: accepted

Repeating the latest strength workout from Today copies its exercise names,
setup, and previous set values into transient draft rows. Repeated sets remain
unconfirmed until the athlete confirms each set; unconfirmed rows are not
saved. Pain, completion, and program linkage are not carried into the new
workout.

Each exercise shows a fixed previous-workout set sequence alongside editable
today rows. Athletes can change reps and kg weight or band color, add sets,
remove sets, and confirm only performed work. Editing a confirmed row returns
it to draft status. Today's pain marker starts unchecked. Repeat uses the
latest strength workout by workout date and refuses to replace an active draft.
Previous-set snapshots and confirmation flags are transient and do not change
the saved-workout or backup schema. Running and sprint repeats remain pending.
Calendar logged strength cards also offer **Repeat this workout**, so the
athlete can choose the source day instead of relying on the latest session.
