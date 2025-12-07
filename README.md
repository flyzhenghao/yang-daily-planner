# Yang's Daily Planner 🌟

A comprehensive daily management web application designed specifically for Year 9 students in New Zealand. This tool helps plan, track, and review daily activities with insightful statistics and health monitoring.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Overview

Yang's Daily Planner is a single-page application that provides:

- **Activity Management**: Add, edit, and delete daily activities with detailed time tracking
- **Smart Categories**: Organize activities by Study, Entertainment, Social, Exercise, Sleep, and custom categories
- **Status Tracking**: Monitor progress with customizable statuses (Planning, Processing, Finished, etc.)
- **Visual Statistics**: Daily, weekly, and monthly analysis with interactive charts
- **Calendar View**: Track daily health scores with month and year views
- **Health Suggestions**: AI-powered recommendations based on activity patterns

## ✨ Features

### 🗓️ Activity Management
- Create activities with date, time range, category, status, and notes
- Quick edit and delete functionality
- Filter and search activities
- Sort by date, category, or status

### 📊 Statistics & Analytics
- **Pie Charts**: Time distribution by category
- **Bar Charts**: Status distribution and trends
- **Line Charts**: Activity patterns over time
- **Period Selection**: Daily, weekly, and monthly views
- **Completion Rate**: Track task completion percentage

### 📅 Calendar
- **Month View**: See all days with health indicators
- **Year View**: Overview of entire year's progress
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

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/yang-daily-planner.git
   cd yang-daily-planner
   ```

2. **Open the application**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve
     ```

3. **Access the app**
   - Direct: Open `index.html`
   - Server: Navigate to `http://localhost:8000`

### Deployment Options

#### GitHub Pages
1. Go to repository Settings → Pages
2. Select "Deploy from a branch"
3. Choose `main` branch and `/ (root)` folder
4. Access at `https://YOUR_USERNAME.github.io/yang-daily-planner`

#### Netlify
1. Connect your GitHub repository
2. Deploy with default settings
3. No build command needed

#### Vercel
1. Import from GitHub
2. Framework: Other
3. Deploy

## 📱 Usage Guide

### Adding an Activity
1. Click **"+ Add Activity"** button
2. Fill in the activity details:
   - Activity name (required)
   - Date and time range
   - Category (Study, Entertainment, etc.)
   - Status (Planning by default)
   - Notes (optional)
3. Click **"Add Activity"**

### Editing/Deleting Activities
- Click ✏️ to edit an activity
- Click 🗑️ to delete an activity

### Viewing Statistics
1. Navigate to **Statistics** page
2. Select period: Daily, Weekly, or Monthly
3. View charts and insights

### Using the Calendar
1. Navigate to **Calendar** page
2. Toggle between Month and Year views
3. Click on any day to see activities
4. Health indicators show completion status

### Customizing Settings
1. Navigate to **Settings** page
2. Add new categories with custom icons and colors
3. Add new status types
4. Reset data if needed

## 🛠️ Technical Details

### Technologies Used
- **React 18** - UI framework
- **Recharts** - Data visualization
- **localStorage** - Data persistence
- **CSS3** - Styling with custom properties
- **Google Fonts** - Nunito & Quicksand

### Project Structure
```
yang-daily-planner/
├── index.html          # Main application file
├── README.md           # Documentation
├── LICENSE             # MIT License
└── .gitignore          # Git ignore file
```

### Data Storage
All data is stored in the browser's localStorage:
- `activities` - Array of activity objects
- `categories` - Array of category objects
- `statuses` - Array of status objects

### Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📐 Design Philosophy

The interface is designed to be:
- **Engaging**: Colorful but not overwhelming
- **Intuitive**: Easy navigation for teenagers
- **Functional**: Focus on productivity
- **Responsive**: Works on desktop and tablets

### Color Palette
- Primary: `#6C5CE7` (Purple)
- Study: `#6C5CE7`
- Entertainment: `#FD79A8`
- Exercise: `#00B894`
- Social: `#FDCB6E`
- Sleep: `#74B9FF`

## 🔒 Privacy

- All data is stored locally in your browser
- No data is sent to external servers
- Clear data anytime via Settings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons: Native emojis
- Fonts: Google Fonts
- Charts: Recharts library
- Inspiration: Year 9 student needs

## 📧 Support

For questions or suggestions, please open an issue in the GitHub repository.

---

Made with ❤️ for Yang's daily success
