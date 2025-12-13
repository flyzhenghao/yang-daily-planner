# Changelog

All notable changes to Yang's Daily Planner will be documented in this file.

## [v1.7.3] - 2025-12-13

### Added
- **TweakCN Live Preview (for theme editor Custom URL)**: Integrated `https://tweakcn.com/live-preview.min.js` so the app can be loaded inside the TweakCN editor and preview theme changes in real time.
- **Theme Code Import (exported CSS)**: Added support for loading TweakCN exported Theme Code via `UI change.css` (including `.dark` variables).
- **Gradient Endpoint Token**: Added `--ydp-gradient-to` to control the second color used by app gradients (sidebar/button/cards).

### Fixed
- **Theme Switch Not Updating UI**: Removed the broken `@tweakcn/core` CDN load and refactored theme handling to avoid overriding `:root/.dark` tokens, so switching themes (e.g., amber/minimal) updates the UI.
- **Dark Mode Compatibility**: Synced the `.dark` class with the app theme toggle so exported `.dark` variables apply correctly.

### Changed
- **Theme System**: Standardized on shadcn/TweakCN tokens (`:root` + `.dark`) and mapped app variables to them.
- **Theme-driven Styling**: Replaced several hard-coded borders/backgrounds/shadows with theme tokens to reflect editor adjustments.

### Docs
- **LocalTunnel Workflow**: Documented why `http://localhost` cannot be used in the TweakCN editor and provided step-by-step tunnel setup + troubleshooting in `TWEAKCN_README.md`.

## [v1.7.2] - 2025-12-13

### Added
- **Settings - Categories Edit/Delete**: Categories can now be edited (name/icon/color) and deleted from Settings → Categories.

### Changed
- **Category Rename Safety**: Renaming a category also updates all related activities to keep data consistent.
- **Category Delete Safety**: When deleting a category that is in use, you must choose a target category to move related activities to (and the app prevents deleting the last remaining category).

## [v1.7.1] - 2025-12-13

### Added
- **Activities Optimizer - Manual Edit Related (Per-Activity)**: "Category consistency" → "Manual edit related" now supports editing related activities one-by-one (with quick Edit buttons), in addition to optional bulk category/status apply.
- **Dashboard - Smart Suggestions (Embedded)**: Restored Smart Suggestions and embedded them under the Health Score chart for a single, unified view.

### Fixed
- **Dashboard - Health Score**: Restored a more dynamic Health Score calculation (Study/Exercise/Sleep/Entertainment) and improved category matching so the score changes even when category names are customized.

## [v1.7.0] - 2025-12-13

### Added
- **Theme Support**: Added automatic theme detection and manual theme switching with persistence.
- **Activities Optimizer - Category Consistency Bulk Edit**: Added a manual bulk-edit action for "Category consistency" issues to update all related activities (not just applying the suggested category).
- **Activities Optimizer - Gaps Smart Create**: Added a "New" action for gap items that pre-fills Time From/To with the gap window and suggests the most frequent historical activity for that time period (supports adding multiple entries).

### Changed
- **Optimizer Flow**: After choosing "Edit activity" (or creating from gaps), the activity modal closes back to the still-open Optimizer dialog instead of exiting Optimizer.

## [v1.6.1] - 2025-12-13

### Added
- **Activities Optimizer - Ignore**: Each optimizer issue now supports **Ignore** (persisted), so ignored items won't be shown again in future checks. Also added **Re-run** and **Reset ignores** controls.
- **Activities Optimizer - Editable Suggestions**: "New category candidate" suggestions can now be edited before creating/applying.

### Fixed
- **New Category Candidate Actions**: Creating a suggested category no longer removes the issue card immediately, so you can continue to apply it to related activities.

### Changed
- **Time Conflicts**: Time overlap issues now include quick actions to open/edit the related activities.

## [v1.6.0] - 2025-12-13

### Added
- **Activities Optimizer**: Added an "🧠 Optimize" tool on the Activities page to automatically check data quality and provide smart suggestions:
  - **Activity ↔ Category validation** via semantic keyword matching + historical consistency analysis (flags mismatches and recommends the most common category)
  - **"Other" refinement**: detects "Other" activities that likely belong to an existing category, and suggests creating a new category for frequently repeated "Other" items
  - **Duplicate/conflict checks**: finds duplicate time slots and overlapping activities in the same period
  - **Gap detection**: extracts unlogged time blocks and suggests Sleep for late-night/early-morning gaps (with quick-add action)

### Changed
- **Activities UI**: Improved the look & feel of Activities inputs/selects (filters + selects) with consistent styling, spacing, focus states, and a custom select arrow.

## [v1.5.2] - 2025-12-13

### Added
- **Dashboard Tooltip**: Added a tooltip to the "Time by Category" chart on the Dashboard. When hovering over a category, a detailed list of activities for that category is displayed, including Duration, Activity, Date, and Time, sorted by duration.

## [v1.5.1] - 2025-12-13

### Changed
- **"Send Report" UI**: The date picker for the "Send Report" feature is now displayed in a modal dialog after clicking the "Send Report" button, instead of being always visible on the sidebar.

## [v1.5.0] - 2025-12-13

### Added
- **Report Date Picker**: Added a date picker to the "Send Report" feature, allowing users to generate a report for any selected date, not just the current day.

### Fixed
- **Auto-Save**: Fixed a bug where adding, deleting, or modifying an activity did not always trigger the "Save to GitHub" function. Now, all these actions will automatically save the changes.

## [v.1.4.11] - 2025-12-11


### Changed
- **UI Improvement**:
  - Increased size of checkboxes in the Activities table for better clickability and ease of use on all devices.

## [v1.4.10] - 2025-12-11

### Added
- **Activity Filter**:
  - Added **Date Range Filter** (From / To) to the Activities page.
  - Allows filtering activities by a specific date range in addition to Category, Status, and Search.

## [v1.4.9] - 2025-12-10

### Changed
- **Removed Statistics Module**: Simplify application structure by removing the dedicated Statistics page.
- **Dashboard Updates**:
  - Renamed "**Time Distribution**" to "**Time by Category**".
  - Added "**Status Distribution**" widget to the dashboard layout.
  - Reorganized charts row to display 3 widgets: Time by Category, Status Distribution, and Health Score.

## [v1.4.8] - 2025-12-10

### Added
- **WhatsApp Notification**: Added a "Send Report" button to generate and send a daily summary via WhatsApp.
- **Settings**: Added "WhatsApp Number" configuration field.

## [v1.4.7] - 2024-12-10

### Added
- **Activity Autocomplete**:
  - Automatically suggests activity names based on historical data when adding/editing activities
  - **Category Auto-fill**: Automatically selects the corresponding category when a known activity name is chosen from the suggestions
  - Enhances data entry speed and consistency

## [v1.4.6] - 2024-12-10

### Added
- **Force Sync from Cloud** feature in Settings → Data Management
  - New "🔄 强制从云端同步 / Force Sync from Cloud" button
  - Clears local timestamp cache and forces data refresh from GitHub
  - Displays count of synced activities upon completion
  - Bilingual instructions (Chinese/English)

### Changed
- Reorganized Settings page layout:
  - 📁 Categories
  - 📋 Statuses
  - 🔄 Data Management (NEW section)
  - ℹ️ About (moved to bottom)
- `loadDataFromGitHub()` function now accepts optional `forceRemote` parameter
  - When `true`, bypasses local timestamp comparison logic

### Fixed
- **Critical sync bug**: Local data not updating when remote data.json has newer records
  - Root cause: localStorage timestamp comparison was preventing remote data from loading
  - Solution: Force sync option allows users to manually override the timestamp check

---

## [v1.4.5] - 2024-12-09

### Added
- Bulk edit and delete functionality for activities
- Confirmation dialogs for destructive actions

### Changed
- Improved mobile responsive layout
- Enhanced activity table with data-label attributes for mobile view

---

## [v1.4.4] - 2024-12-08

### Added
- Local data persistence protection
  - Compares local vs remote timestamps before loading
  - Prevents accidental overwrite of local edits

### Changed
- Improved data synchronization logic

---

## [v1.4.3] - 2024-12-07

### Added
- Duration display with ⏱️ badge throughout the app
- Time validation in activity modal (prevents invalid time ranges)

### Fixed
- Time calculation for activities spanning midnight

---

## [v1.4.2] - 2024-12-06

### Added
- Dashboard date picker with daily/weekly/monthly/yearly views
- Health score calculation based on activity balance

### Changed
- Improved statistics page with period selector

---

## [v1.4.1] - 2024-12-05

### Added
- GitHub token configuration modal
- Save to GitHub functionality with progress indicator

### Fixed
- Mobile navigation bar styling

---

## [v1.4.0] - 2024-12-04

### Added
- GitHub Pages deployment support
- Cloud data synchronization via GitHub API
- Year view in calendar

### Changed
- Single-file architecture (HTML + CSS + JS in one file)

---

## [v1.3.0] - 2024-12-01

### Added
- Calendar view with month/year toggle
- Activity health indicators on calendar days
- Expandable activity details in calendar sidebar

---

## [v1.2.0] - 2024-11-28

### Added
- Statistics page with pie and bar charts
- Category and status management in Settings
- Smart suggestions based on activity patterns

---

## [v1.1.0] - 2024-11-25

### Added
- Activity filtering and search
- Continuous add mode (add multiple activities without closing modal)
- Auto-advance time feature

---

## [v1.0.0] - 2024-11-20

### Initial Release
- Dashboard with activity overview
- Activity management (add, edit, delete)
- Categories: Study, Entertainment, Social, Exercise, Sleep, Other
- Statuses: Planning, Processing, Finished, Partial Finished, Abandoned
- Local storage persistence
- Mobile responsive design
