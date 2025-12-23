## 2025-02-23 - Accessibility Improvements
**Learning:** Material UI's `TextField` component requires using `inputProps` (lowercase 'i') rather than `InputProps` (uppercase 'I') to apply attributes like `aria-label` directly to the underlying `<input>` element. Using `InputProps` applies them to the wrapper div, which screen readers may ignore for input labeling purposes.
**Action:** Always verify where accessibility attributes land in the DOM when using complex UI component libraries.
