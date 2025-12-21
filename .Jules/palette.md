## 2025-12-21 - Replace native confirm with Dialog
**Learning:** Users prefer custom UI dialogs over native `window.confirm` for destructive actions like deletion, as it provides better visual consistency and context.
**Action:** When implementing delete or destructive actions, always use a custom Material UI `Dialog` component instead of native browser alerts.