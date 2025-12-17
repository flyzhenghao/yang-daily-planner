(function (global) {
  "use strict";

  global.APP_VERSION = "v2.0.2";
  global.GITHUB_OWNER = "flyzhenghao";
  global.GITHUB_REPO = "yang-daily-planner";
  global.GITHUB_FILE_PATH = "data.json";
  global.GITHUB_BRANCH = "main";
  global.GITHUB_TOKEN_KEY = "yang_github_token";

  global.defaultCategories = [
    { id: 1, name: "Study", color: "#6C5CE7", icon: "📚" },
    { id: 2, name: "Entertainment", color: "#FD79A8", icon: "🎮" },
    { id: 3, name: "Social", color: "#FDCB6E", icon: "👥" },
    { id: 4, name: "Exercise", color: "#00B894", icon: "🏃" },
    { id: 5, name: "Sleep", color: "#74B9FF", icon: "😴" },
    { id: 6, name: "Other", color: "#636E72", icon: "📌" },
  ];
  global.defaultStatuses = [
    { id: 1, name: "Planning", color: "#74B9FF" },
    { id: 2, name: "Processing", color: "#FDCB6E" },
    { id: 3, name: "Finished", color: "#00B894" },
    { id: 4, name: "Partial Finished", color: "#6C5CE7" },
    { id: 5, name: "Abandoned", color: "#B2BEC3" },
  ];
  global.PROFILE_KEY = "yang_profile";
  global.defaultProfile = {
    name: "Yang",
    school: "",
    grade: "Year 9",
    email: "",
    avatarDataUrl: "",
  };

  global.OPTIMIZER_IGNORED_KEY = "yang_optimizer_ignored_issues";
  global.OPTIMIZER_GAPS_ENABLED_KEY = "yang_optimizer_gaps_enabled";
  global.OPTIMIZER_CATEGORY_ENABLED_KEY = "yang_optimizer_category_enabled";
  global.OPTIMIZER_TIME_ENABLED_KEY = "yang_optimizer_time_enabled";
  global.REMINDER_ENABLED_KEY = "yang_reminder_enabled";
})(window);
