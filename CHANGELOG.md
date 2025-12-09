## v1.4.5 - 2025-12-09

### Fixed
- **Mobile Layout**: Fixed "wasted space" issue by forcing full width and removing default margins on mobile devices.
- **Mobile Density**: Completely redesigned Activity Cards on mobile using a compact 3-row layout. Hidden labels and notes, optimized fonts, and reordered fields for maximum density.
- **Mobile Calendar**: Improved Calendar page layout on mobile to stack the activity list below the calendar for better accessibility.
- **Version Display**: Added version number to the Settings page and as a subtle watermark on mobile for easier tracking.

## v1.4.4 - 2025-12-09

### Fixed

#### 1. Time Validation on Activity Save
**User Requirement**: 
- "点击 add activity，要求：Time To 必须大于 Time From"
- "Time To 如果小于 Time From，点击'add activity' 时候要提示报错，要求修改并且不能保存，直到修改正确"

**Implementation**:
- Added validation in Modal's `handleSubmit()` function that runs when user clicks "Add Activity" or "Save Changes"
- Validation logic: converts both times to minutes using `timeStrToMins()` helper and checks if `Time To > Time From`
- If `Time To ≤ Time From`: displays inline error message in the modal
  - Error message: "❌ 时间错误！'Time To' 必须晚于 'Time From'。"
- Form submission is blocked (returns early) - user cannot save until they correct the time values
- Time To input field allows any value to be entered, validation only happens on submit (not on input change)
- This ensures clear feedback at the moment user clicks "Add Activity" button

#### 2. Prevent Loss of Recent Local Edits
- The app now stores a `yang_last_updated` timestamp in `localStorage` whenever activities change
- On load, compares `yang_last_updated` with remote `data.json`'s `lastUpdated` field
- If local changes are newer, local `localStorage` is used instead of overwriting with older remote data
- Auto-save to GitHub disabled per user request: changes only persist locally until user manually clicks "Save to GitHub"

#### 3. Bulk Actions for Activities (New)
   - Added checkboxes to "Activities" list for multi-selection
   - Added "Select All" checkbox in table header
   - Added Bulk Actions toolbar (appears when items are selected):
     - **Bulk Delete**: Delete multiple activities at once
     - **Bulk Edit**: Batch update Category and Status for selected items

### User Requirements & Assistant Response
1. **Time validation**: ✅ Implemented with inline error + form submission prevention
2. **Local persistence**: ✅ Timestamp-based comparison ensures local edits aren't lost
3. **Manual GitHub save only**: ✅ No auto-save on add/edit/delete operations
4. **Bulk Actions**: ✅ Implemented multi-seleciton, bulk delete, and bulk edit (Category/Status)

### Bug Fixes
- **Bulk Delete**: Fixed issue where bulk delete might not work due to stale state. Improved UX to not clear selection if deletion is cancelled.
- **UI Update**: Replaced native browser `confirm()` dialog with a custom `ConfirmModal` for consistent experience and to avoid "no dialog" issues.
- **Mobile Support**: 
  - Added responsive design for mobile devices (screens < 768px).
  - Implemented **Bottom Navigation Bar** for better mobile accessibility.
  - Converted "Activities" table to **Card View** on mobile.
  - Optimized dashboard grid and modals for small screens.
  - **Layout Optimization**: Reduced padding on mobile to maximize screen real estate and remove "empty" space.
