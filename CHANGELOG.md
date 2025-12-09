## v1.4.3 - 2025-12-09

### Fixed

#### 1. Time Validation on Activity Save
**User Requirement**: 
- "点击 add activity，要求：Time To 必须大于 Time From"
- "Time To 如果小于 Time From，要提醒错误，要求修改并且不能保存，直到修改正确"

**Implementation**:
- Added client-side validation in the Modal's `handleSubmit()` function
- When user clicks "Add Activity" or "Save Changes", the app checks if `Time To > Time From`
- If invalid: displays alert "⚠️ 'Time To' must be later than 'Time From'. Please adjust the times."
- Prevents form submission until times are corrected
- Also added real-time validation on Time To input: if user tries to set Time To equal to Time From, it auto-adjusts to 1 hour later
- Used helper function `timeStrToMins()` to convert HH:MM format to minutes for comparison

#### 2. Prevent Loss of Recent Local Edits
- The app now stores a `yang_last_updated` timestamp in `localStorage` whenever activities change
- On load, compares `yang_last_updated` with remote `data.json`'s `lastUpdated` field
- If local changes are newer, local `localStorage` is used instead of overwriting with older remote data
- Auto-save to GitHub disabled per user request: changes only persist locally until user manually clicks "Save to GitHub"

### User Requirements & Assistant Response
1. **Time validation**: ✅ Implemented with alert + form submission prevention
2. **Local persistence**: ✅ Timestamp-based comparison ensures local edits aren't lost
3. **Manual GitHub save only**: ✅ No auto-save on add/edit/delete operations
