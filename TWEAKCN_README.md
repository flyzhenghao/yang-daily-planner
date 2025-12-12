# TweakCN 实时预览使用说明

## 🎯 概述

TweakCN 已经被集成到 Yang's Daily Planner 项目中，为开发者提供强大的实时预览功能。

## ✨ 主要功能

- **实时热重载**: 代码修改后自动刷新浏览器
- **智能文件监听**: 监听 HTML、CSS、JS、JSON 文件变化
- **性能优化**: 防抖节流，避免频繁刷新
- **开发者友好**: 详细的控制台日志和通知
- **兼容性好**: 支持 React、Babel、ES6+

## 🚀 快速开始

### 1. 启用功能

TweakCN 已经在 `index.html` 中自动启用。当你打开页面时，控制台会显示：

```
✅ TweakCN 实时预览已启用
🔧 TweakCN 实时预览功能已启用
📝 使用方法:
   - 修改代码后按 Ctrl+S 保存
   - 浏览器会自动刷新显示修改
```

### 2. 基本使用

1. **修改代码**: 在你的编辑器中修改 `index.html` 或相关文件
2. **保存文件**: 按 `Ctrl+S` (Windows/Linux) 或 `Cmd+S` (Mac)
3. **自动刷新**: 浏览器会自动刷新，显示最新的修改
4. **查看日志**: 打开浏览器开发者工具查看控制台日志

## ⚙️ 配置选项

### 在 `tweakcn.config.js` 中配置

```javascript
window.TweakCNConfig = {
  // 基础配置
  enable: true,           // 启用 TweakCN
  hotReload: true,        // 启用热重载
  autoRefresh: true,      // 自动刷新
  
  // 文件监听
  watchExtensions: ['html', 'css', 'js', 'json'],
  excludePaths: ['node_modules', '.git', 'dist'],
  
  // 性能配置
  refreshDelay: 100,      // 刷新延迟(毫秒)
  throttle: 100,          // 节流时间
  debounce: 300           // 防抖时间
};
```

### 在 HTML 中自定义配置

```javascript
// 在 index.html 的 script 标签中
window.TweakCN = window.TweakCN || {
    enable: true,
    hotReload: true,
    autoRefresh: true,
    logLevel: "info",
    refreshDelay: 100
};
```

## 🎮 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+S` / `Cmd+S` | 保存文件并触发刷新 |
| `Ctrl+R` / `Cmd+R` | 手动刷新页面 |
| `F12` | 打开/关闭开发者工具 |
| `Ctrl+Shift+C` | 清除缓存并刷新 |

## 📁 支持的文件类型

- **HTML 文件**: `.html`, `.htm`
- **样式文件**: `.css`, `.scss`, `.sass`
- **脚本文件**: `.js`, `.jsx`, `.ts`, `.tsx`
- **配置文件**: `.json`, `.xml`
- **文本文件**: `.txt`, `.md`

## 🔧 高级功能

### 1. 自定义刷新模式

```javascript
// 快速刷新(不丢失状态)
refreshMode: 'hot'

// 完全重新加载
refreshMode: 'reload'
```

### 2. 性能监控

TweakCN 会自动监控页面性能：

- 页面加载时间
- 文件监听响应时间
- 刷新操作耗时

### 3. 错误处理

```javascript
// TweakCN 加载失败时的处理
window.addEventListener('error', function(e) {
    if (e.message.includes('TweakCN')) {
        console.warn('TweakCN 加载失败，但应用仍可正常使用');
    }
});
```

## 🐛 故障排除

### 问题 1: TweakCN 没有加载

**症状**: 控制台没有显示 TweakCN 相关日志

**解决方案**:
1. 检查网络连接
2. 确认 CDN 可访问
3. 查看浏览器控制台错误信息

### 问题 2: 文件修改后没有自动刷新

**症状**: 修改文件后浏览器没有刷新

**解决方案**:
1. 确认文件扩展名在监听列表中
2. 检查文件路径是否被排除
3. 手动按 `Ctrl+R` 刷新
4. 清除浏览器缓存

### 问题 3: 刷新过于频繁

**症状**: 轻微修改就触发频繁刷新

**解决方案**:
```javascript
// 增加防抖时间
debounce: 500

// 排除特定文件
excludePaths: ['*.log', '*.tmp']
```

## 📊 性能优化建议

1. **合理设置刷新延迟**
   ```javascript
   refreshDelay: 100-500  // 根据项目大小调整
   ```

2. **排除不需要的文件**
   ```javascript
   excludePaths: [
       'node_modules',
       '.git',
       'dist',
       'build',
       '*.log'
   ]
   ```

3. **限制监听的文件类型**
   ```javascript
   watchExtensions: ['html', 'css', 'js']  // 只监听必要的类型
   ```

## 🔗 相关链接

- [TweakCN 官方文档](https://tweakcn.github.io/)
- [项目 GitHub 仓库](https://github.com/flyzhenghao/yang-daily-planner)
- [React 官方文档](https://reactjs.org/)
- [Babel 官方文档](https://babeljs.io/)

## 💡 使用技巧

1. **开发时保持开发者工具打开**，以便查看实时日志
2. **使用版本控制**，确保重要修改不会丢失
3. **定期清理缓存**，避免缓存导致的显示问题
4. **合理配置监听路径**，提高性能
5. **使用语义化日志**，便于调试和追踪

## 🆘 获取帮助

如果遇到问题：

1. 首先查看浏览器控制台的错误信息
2. 检查 `tweakcn.config.js` 配置文件
3. 确认网络连接和 CDN 可访问性
4. 在项目 GitHub 仓库中提交 Issue

---

**Happy Coding! 🎉**

TweakCN 让前端开发变得更简单、更高效。享受实时预览带来的开发乐趣吧！