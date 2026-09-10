# Strength logger UX backlog

Follow-up ideas captured during R03 validation. These are intentionally
separate from the shortened-workout implementation.

- Redesign the **Edit log** dialog so saved exercises/sets being edited are
  visually separate from controls for adding new exercises and sets. Improve
  button versus checkbox placement and make the completed-versus-new workflow
  immediately clear.
- Improve **Strength progression** review: show the exercise name prominently,
  list each comparable session with its date and exact sets, and make each
  session open or locate the corresponding workout in History.
- In **Edit log**, merge a newly added exercise into the existing row when its
  exercise identity matches (name plus variation, equipment, and load type),
  appending new sets instead of creating a duplicate line.
- Expand **Strength progression** to cover all logged strength exercises, not
  only exercises with saved targets. Keep Stats compact with grouped or
  collapsible rows and show a clear setup/target state for history-only
  exercises.
- Make strength load type selection visibly available in the main set-entry
  area instead of hiding kg/bodyweight/band under setup. Explore a fast
  bodyweight path when no numeric load is entered, while guarding against
  accidentally treating a missing kg value as bodyweight.
