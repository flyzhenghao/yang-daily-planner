## v1.3.1 - 2025-12-09

### Fixed
- Validate activity time before saving: when adding or editing an activity, `Time To` must be later than `Time From`. If `Time To` is less than or equal to `Time From`, the UI now shows a warning and prevents saving until corrected. (User request + implemented)

- Prevent loss of recent local edits when remote `data.json` is older: the app now stores a `yang_last_updated` timestamp in `localStorage` and prefers newer local changes over an older remote `data.json` during load.

### Notes (from user request and assistant reply)
- User requirement: "Time To 必须大于 Time From；如果 Time To < Time From，要提醒并不能保存。"
- User requirement: "增删改 activity 不应自动触发保存到 GitHub；手动点击 'Save to GitHub' 应正常工作。"
- Assistant implemented: client-side validation for time ranges; improved local persistence by comparing timestamps so local edits are not overwritten by an older remote file. Manual 'Save to GitHub' still requires a valid GitHub token configured in Settings -> GitHub Token.

If you want, I can also bump `APP_VERSION` in `index.html` and add a more detailed release note.
