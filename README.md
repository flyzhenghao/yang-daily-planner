# Yang's Daily Planner 🌟

A comprehensive daily management web application designed specifically for Year 9 students in New Zealand. This tool helps plan, track, and review daily activities with insightful statistics and health monitoring.

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Overview

Yang's Daily Planner is a single-page application that provides:

- **Activity Management**: Add, edit, and delete daily activities with detailed time tracking
- **Smart Categories**: Organize activities by Study, Entertainment, Social, Exercise, Sleep, and custom categories
- **Status Tracking**: Monitor progress with customizable statuses (Planning, Processing, Finished, etc.)
- **Visual Statistics**: Daily, weekly, and monthly analysis with interactive charts
- **Calendar View**: Track daily health scores with month and year views
- **Health Suggestions**: AI-powered recommendations based on activity patterns

## 📝 Changelog / 版本变更说明

### v1.2.0 (2024-12-08)

**用户需求 / User Request:**
- 当点击 +Add Activity 按钮，填写完然后点击 Add Activity
- 新要求自动进入创建下一条，开始时间就是之前的结束时间

**实现变更 / Changes Made:**
- ✅ 添加活动后弹窗保持打开，自动准备创建下一条
- ✅ 新活动的开始时间 (Time From) 自动设为上一条的结束时间 (Time To)
- ✅ 新活动的结束时间自动设为开始时间 +1 小时
- ✅ 保留日期和分类设置，只清空活动名称和备注
- ✅ 显示已添加数量计数器 (如 "✓ 3 added")
- ✅ 提交按钮文字变化: "Add Activity" → "Add Next +"
- ✅ 取消按钮在添加后变为 "✓ Done"
- ✅ 光标自动聚焦到活动名称输入框

**交互流程 / Workflow:**
1. 点击 "+ Add Activity" 打开弹窗
2. 填写活动信息，点击 "Add Activity"
3. 活动被添加，弹窗保持打开
4. 表单重置，Time From = 上一条的 Time To
5. 继续添加下一条，或点击 "✓ Done" 完成

---

### v1.1.0 (2024-12-08)

**用户需求 / User Request:**
- Calendar 右侧 activity 的修改按钮去掉
- 删除按钮放到点击 activity 打开以后的卡片右下角
- 状态 tag 不要新起一行，而是和标题并排
- 这样可以尽可能显示多个 activity

**实现变更 / Changes Made:**
- ✅ 移除了日历活动列表中的编辑/删除按钮，界面更简洁
- ✅ 点击活动后展开详情卡片，编辑和删除按钮在详情卡片右下角
- ✅ 状态标签(Status Badge)与活动标题并排显示在同一行
- ✅ 活动列表更紧凑，单位高度减小，可显示更多活动
- ✅ 新增点击展开/收起交互，提升用户体验

**技术细节 / Technical Details:**
- 新增 `.cal-activity` 紧凑样式类
- 新增 `.cal-detail` 展开详情卡片样式
- 状态标签使用 `white-space: nowrap` 防止换行
- 活动列表支持滚动，最大高度 450px

---

### v1.0.0 (2024-12-08)

**Initial Release / 首次发布:**
- 完整的活动管理功能（增删改查）
- Dashboard 仪表盘视图
- Calendar 日历视图（月/年）
- Statistics 统计分析
- Settings 设置页面
- GitHub 数据同步功能
- 健康评分系统
- 智能建议功能

---

## ✨ Features

### 🗓️ Activity Management
- Create activities with date, time range, category, status, and notes
- Quick edit and delete functionality
- Filter and search activities
- Sort by date, category, or status

### 📊 Statistics & Analytics
- **Pie Charts**: Time distribution by category
- **Bar Charts**: Status distribution and trends
- **Period Selection**: Daily, weekly, and monthly views
- **Completion Rate**: Track task completion percentage

### 📅 Calendar
- **Month View**: See all days with health indicators
- **Year View**: Overview of entire year's progress
- **Compact Activity List**: Status inline with title for better space efficiency
- **Expandable Details**: Click to view full details with edit/delete options
- **Health Indicators**:
  - 🟢 Excellent (80%+ completion)
  - 🔵 Good (60-80% completion)
  - 🟠 Fair (40-60% completion)
  - 🔴 Poor (<40% completion)

### 💡 Smart Suggestions
Personalized recommendations based on:
- Study time balance (recommended: 3-5 hours for Y9)
- Exercise requirements (recommended: 30-60 minutes daily)
- Sleep patterns (recommended: 8-10 hours for teenagers)
- Screen time management

### ⚙️ Customization
- Add/edit/delete categories with custom colors and icons
- Add/edit/delete status types
- Persistent data storage using localStorage
- GitHub sync for cross-device data

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/flyzhenghao/yang-daily-planner.git
   cd yang-daily-planner
   ```

2. **Open the application**
   - Simply open `index.html` in your web browser

3. **Configure GitHub Sync (Optional)**
   - Click "🔑 GitHub Token" in sidebar
   - Create a Personal Access Token with `repo` scope
   - Paste token and save

## 📱 Usage Guide

### Calendar Activity List (v1.1.0)
1. Click on a date to see activities
2. Each activity shows: icon, title, status badge, and time
3. Click on any activity to expand details
4. Edit or Delete buttons appear in expanded view
5. Click again to collapse

## 🛠️ Technical Details

### Technologies Used
- **React 18** - UI framework
- **localStorage** - Data persistence
- **GitHub API** - Cloud sync
- **CSS3** - Styling with custom properties
- **Google Fonts** - Nunito & Quicksand

### Project Structure
```
yang-daily-planner/
├── index.html          # Main application file
├── data.json           # Synced data file
├── README.md           # Documentation
├── LICENSE             # MIT License
└── .gitignore          # Git ignore file
```

## 📐 Design Philosophy

The interface is designed to be:
- **Engaging**: Colorful but not overwhelming
- **Intuitive**: Easy navigation for teenagers
- **Functional**: Focus on productivity
- **Compact**: Maximize information density without clutter

## 🔒 Privacy

- All data is stored locally in your browser
- GitHub sync is optional and user-controlled
- Clear data anytime via Settings

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ for Yang's daily success
