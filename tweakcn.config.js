// TweakCN 配置文件
// 用于优化 Yang's Daily Planner 的实时预览体验

window.TweakCNConfig = {
  // 基础配置
  enable: true,
  hotReload: true,
  autoRefresh: true,

  // 文件监听配置
  watchExtensions: ['html', 'css', 'js', 'json'],
  watchPaths: ['./'],
  excludePaths: [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.DS_Store',
    '*.log',
    '*.tmp'
  ],

  // 刷新配置
  refreshDelay: 100,
  refreshMode: 'reload', // 'reload' | 'hot'

  // 日志配置
  logLevel: 'info', // 'debug' | 'info' | 'warn' | 'error'
  showNotifications: true,

  // 编辑器配置
  editor: {
    autoSave: true,
    saveDelay: 500,
    formatOnSave: true
  },

  // 预览配置
  preview: {
    fullPageReload: false,
    preserveScrollPosition: true,
    highlightChanges: true
  },

  // 兼容性配置
  compatibility: {
    react: true,
    babel: true,
    es6: true
  },

  // 自定义命令
  commands: {
    // 快速刷新
    refresh: {
      key: 'ctrl+r',
      action: 'forceReload'
    },
    // 切换开发者工具
    devtools: {
      key: 'f12',
      action: 'toggleDevtools'
    },
    // 清除缓存
    clearCache: {
      key: 'ctrl+shift+c',
      action: 'clearCache'
    }
  },

  // 通知配置
  notifications: {
    position: 'top-right',
    duration: 3000,
    enableSound: false
  },

  // 性能配置
  performance: {
    throttle: 100,
    debounce: 300,
    maxConcurrentTasks: 5
  }
};

// TweakCN 初始化完成后的回调
window.TweakCNReady = function(tweakcn) {
  console.log('🎉 TweakCN 已准备就绪');

  // 主题同步 - 监听 TweakCN 主题变化
  if (tweakcn.on && typeof tweakcn.on === 'function') {
    tweakcn.on('themeChange', function(theme) {
      console.log('🎨 TweakCN 主题切换:', theme);
      if (window.setTheme) {
        window.setTheme(theme);
      }
    });
  }

  // 自定义事件监听
  tweakcn.on('beforeRefresh', function() {
    console.log('🔄 准备刷新页面...');
  });

  tweakcn.on('afterRefresh', function() {
    console.log('✅ 页面刷新完成');
  });

  tweakcn.on('error', function(error) {
    console.error('❌ TweakCN 错误:', error);
  });

  // 性能监控
  tweakcn.on('performance', function(metrics) {
    if (metrics.loadTime > 1000) {
      console.warn('⚠️ 页面加载较慢:', metrics.loadTime + 'ms');
    }
  });
};

// 导出配置供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.TweakCNConfig;
}
