# Yang's Daily Planner 🌟

A beautiful, feature-rich daily activity planner designed for Year 9 students. Built as a single-file React application with GitHub Pages deployment support.

**Current Version: v1.4.6**

![Version](https://img.shields.io/badge/version-1.4.6-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 📊 Dashboard
- Daily/Weekly/Monthly/Yearly activity overview
- Time distribution pie chart
- Health score calculation
- Smart suggestions based on activity patterns

### 📝 Activities Management
- Add, edit, and delete activities
- Bulk edit and delete support
- Search and filter by category/status
- Duration tracking with automatic calculation

### 📅 Calendar View
- Month and Year view toggle
- Health indicators for each day
- Expandable activity details
- Visual progress tracking

### 📈 Statistics
- Time by category analysis
- Status distribution charts
- Completion rate tracking
- Period-based insights (daily/weekly/monthly)

### ⚙️ Settings
- Customizable categories with icons and colors
- Configurable activity statuses
- **Data Management** (NEW in v1.4.6)
  - Force sync from cloud
  - Reset all data option
- GitHub token configuration

### ☁️ Cloud Sync
- Automatic sync with GitHub repository
- Manual save to GitHub
- **Force sync from cloud** to resolve sync conflicts

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)

1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Access your planner at `https://[username].github.io/yang-daily-planner`

### Option 2: Local Usage

1. Download `index.html`
2. Open in any modern browser
3. Start planning!

## 🔧 GitHub Sync Setup

To enable cloud synchronization:

1. Go to [GitHub Token Settings](https://github.com/settings/tokens/new?scopes=repo&description=Yang+Daily+Planner)
2. Generate a new token (classic) with `repo` scope
3. In the app, click **🔑 GitHub Token** in the sidebar
4. Paste your token and save

### Sync Features

| Feature | Description |
|---------|-------------|
| 💾 Save to GitHub | Manually push local data to repository |
| 🔄 Force Sync | Pull latest data from cloud, overwriting local cache |
| Auto-sync | Loads remote data on app start (if newer than local) |

## 📱 Mobile Support

Fully responsive design with:
- Bottom navigation bar on mobile
- Touch-friendly activity cards
- Optimized table layout for small screens

## 🗂️ Default Categories

| Category | Icon | Color |
|----------|------|-------|
| Study | 📚 | Purple |
| Entertainment | 🎮 | Pink |
| Social | 👥 | Orange |
| Exercise | 🏃 | Green |
| Sleep | 😴 | Blue |
| Other | 📌 | Gray |

## 📋 Activity Statuses

- **Planning** - Scheduled for future
- **Processing** - Currently in progress
- **Finished** - Completed successfully
- **Partial Finished** - Partially completed
- **Abandoned** - Cancelled or skipped

## 🔄 Version 1.4.6 Updates

### New: Force Sync from Cloud

If your local data is out of sync with GitHub (e.g., cloud has 32 activities but local shows 19):

1. Go to **Settings** → **Data Management**
2. Click **🔄 强制从云端同步 / Force Sync from Cloud**
3. Wait for sync to complete

**Alternative (Browser Console):**
```javascript
localStorage.removeItem("yang_last_updated");
location.reload();
```

### Why This Happens

The app compares local and remote timestamps to prevent data loss. If your local timestamp is newer (even with fewer records), it will use local data. Force sync bypasses this check.

## 🛠️ Technical Details

- **Framework**: React 18 (via CDN)
- **Styling**: Custom CSS with CSS Variables
- **Storage**: localStorage + GitHub API
- **Build**: Single HTML file (no build step required)
- **Fonts**: Nunito, Quicksand (Google Fonts)

## 📁 File Structure

```
yang-daily-planner/
├── index.html      # Main application (HTML + CSS + JS)
├── data.json       # Cloud data storage
├── CHANGELOG.md    # Version history
└── README.md       # This file
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

MIT License - feel free to use and modify for personal or educational purposes.

---

Made with ❤️ for Yang's daily success!
