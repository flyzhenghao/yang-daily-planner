// js/config.js
export const APP_VERSION = "v2.0.0"; // 更新版本号标记模块化
export const GITHUB_OWNER = "flyzhenghao";
export const GITHUB_REPO = "yang-daily-planner";
export const GITHUB_FILE_PATH = "data.json";
export const GITHUB_BRANCH = "main";
export const GITHUB_TOKEN_KEY = "yang_github_token";
export const PROFILE_KEY = "yang_profile";
export const OPTIMIZER_IGNORED_KEY = "yang_optimizer_ignored_issues";
export const OPTIMIZER_GAPS_ENABLED_KEY = "yang_optimizer_gaps_enabled";
export const OPTIMIZER_CATEGORY_ENABLED_KEY = "yang_optimizer_category_enabled";
export const OPTIMIZER_TIME_ENABLED_KEY = "yang_optimizer_time_enabled";
export const REMINDER_ENABLED_KEY = "yang_reminder_enabled";

export const defaultCategories = [
    { id: 1, name: "Study", color: "#6C5CE7", icon: "📚" },
    { id: 2, name: "Entertainment", color: "#FD79A8", icon: "🎮" },
    { id: 3, name: "Social", color: "#FDCB6E", icon: "👥" },
    { id: 4, name: "Exercise", color: "#00B894", icon: "🏃" },
    { id: 5, name: "Sleep", color: "#74B9FF", icon: "😴" },
    { id: 6, name: "Other", color: "#636E72", icon: "📌" },
];

export const defaultStatuses = [
    { id: 1, name: "Planning", color: "#74B9FF" },
    { id: 2, name: "Processing", color: "#FDCB6E" },
    { id: 3, name: "Finished", color: "#00B894" },
    { id: 4, name: "Partial Finished", color: "#6C5CE7" },
    { id: 5, name: "Abandoned", color: "#B2BEC3" },
];

export const defaultProfile = {
    name: "Yang",
    school: "",
    grade: "Year 9",
    email: "",
    avatarDataUrl: "",
};
