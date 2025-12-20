## 2025-02-14 - AudioItem Input Accessibility
**Learning:** Material UI's `TextField` needs explicit `inputProps` or `InputProps` with `aria-label` when it has no visible label, especially for compact numeric inputs or specialized text areas in audio editors. The `type="number"` TextField is particularly prone to lacking context when used inside a toolbar-like layout.
**Action:** Always verify `TextField` components in dense toolbars have accessible names using `inputProps={{ 'aria-label': '...' }}`.
