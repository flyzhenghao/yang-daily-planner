# Yang's Daily Planner 🌟

A comprehensive daily management web application designed specifically for Year 9 students in New Zealand. This tool helps plan, track, and review daily activities with insightful statistics and health monitoring.

![Version](https://img.shields.io/badge/version-1.4.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Overview

Yang's Daily Planner is a single-page application that provides:

- **Activity Management**: Add, edit, and delete daily activities with detailed time tracking
- **Smart Categories**: Organize activities by Study, Entertainment, Social, Exercise, Sleep, and custom categories
- **Status Tracking**: Monitor progress with customizable statuses (Planning, Processing, Finished, etc.)
- **Visual Statistics**: Daily, weekly, monthly, and yearly analysis with interactive charts
- **Calendar View**: Track daily health scores with month and year views
- **Health Suggestions**: AI-powered recommendations based on activity patterns

## 📝 Changelog / 版本变更说明

### v1.4.0 (2024-12-09)

**用户需求 / User Request:**
- 每次增删改操作都自动调用 "save to github" 操作，这样不用手工做点击这个按钮了

**实现变更 / Changes Made:**

**自动保存到GitHub:**
- ✅ 每次增删改操作后自动保存到GitHub，无需手动点击按钮
- ✅ 添加活动、编辑活动、删除活动后自动保存
- ✅ 添加/删除分类、添加/删除状态后自动保存
- ✅ 1秒防抖机制，避免频繁保存
- ✅ 初始加载时不触发保存
- ✅ 静默保存，不显示弹窗提示（避免打断用户操作）

**技术细节 / Technical Details:**
- 使用 `useEffect` 监听 `activities`、`categories`、`statuses` 的变化
- 使用 `React.useRef` 实现防抖和初始加载标志
- 自动保存时使用 `console.log` 记录，不显示弹窗

---

### v1.3.0 (2024-12-09)

**用户需求 / User Request:**
1. Dashboard 要加上可以根据日历选择查看任意一天的统计信息，同时也有月度和年度维度的统计，默认为今天的统计数据。现在的数据统计信息不准，Today 板块 activity list 也没有限定在当天的
2. Activities 增加一个时长自动计算的字段

**实现变更 / Changes Made:**

**Dashboard 增强:**
- ✅ 新增日期选择器 (Date Picker)，可选择任意日期查看统计
- ✅ 新增 "Today" 快捷按钮，一键返回今天
- ✅ 新增 Daily / Weekly / Monthly / Yearly 四个维度切换
- ✅ 修复统计数据计算错误，现在准确计算选定范围的时长
- ✅ 修复 Activity List 只显示选定日期/范围的活动
- ✅ 健康评分根据所选时间维度自动调整目标值
- ✅ 智能建议根据所选时间维度显示对应提示

**Duration 时长自动计算:**
- ✅ Activities 列表新增 Duration 列，自动显示每个活动的时长
- ✅ Activities 页面显示筛选结果的总时长统计
- ✅ Calendar 活动详情显示时长
- ✅ 新建/编辑活动弹窗实时显示计算的时长
- ✅ 支持跨午夜活动的时长计算（如 23:00-01:00 = 2h）
- ✅ 新增 `calcDuration()` 和 `formatDuration()` 工具函数
- ✅ 新增 `.duration-badge` 样式，醒目显示时长

**Bug 修复:**
- ✅ 修复时区问题导致的日期比较错误
- ✅ 新增 `getLocalDateStr()` 函数确保日期一致性
- ✅ 修复 Dashboard Today 板块显示所有活动而非当天活动的问题

**技术细节 / Technical Details:**
- 新增 `getLocalDateStr(date)` - 获取本地日期字符串，避免时区问题
- 新增 `calcDuration(timeFrom, timeTo)` - 计算两个时间点之间的分钟数
- 新增 `formatDuration(mins)` - 格式化时长显示 (如 "2h 30m")
- Dashboard 使用 `useMemo` 优化日期范围和统计计算性能
- 新增 `.date-picker-row` 和 `.duration-badge` CSS 样式

---

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
- **Auto-calculated duration** showing time spent on each activity
- Quick edit and delete functionality
- Filter and search activities
- Sort by date, category, or status
- Total duration display for filtered results

### 📊 Dashboard
- **Date Picker**: Select any date to view statistics
- **Multi-dimension Views**: Daily, Weekly, Monthly, Yearly
- Real-time statistics for selected time range
- Health score adjusted to time dimension
- Activity list filtered to selected period

### 📈 Statistics & Analytics
- **Pie Charts**: Time distribution by category
- **Bar Charts**: Status distribution and trends
- **Period Selection**: Daily, weekly, and monthly views
- **Completion Rate**: Track task completion percentage

### 📅 Calendar
- **Month View**: See all days with health indicators
- **Year View**: Overview of entire year's progress
- **Compact Activity List**: Status inline with title, duration displayed
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

### Dashboard Date Selection (v1.3.0)
1. Use the date picker to select any date
2. Click "Today" to return to current date
3. Switch between Daily/Weekly/Monthly/Yearly views
4. All stats and activity list update automatically

### Activity Duration (v1.3.0)
- Duration is automatically calculated from Time From and Time To
- Displayed in Activities list, Calendar details, and Add/Edit modal
- Supports overnight activities (e.g., 23:00-01:00 = 2h)

### Calendar Activity List (v1.1.0)
1. Click on a date to see activities
2. Each activity shows: icon, title, status badge, time, and duration
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
