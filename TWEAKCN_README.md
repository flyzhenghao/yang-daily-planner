# TweakCN 实时预览使用说明

这个项目可以作为 `https://tweakcn.com/editor/theme` 的 **Custom URL**，用于在 TweakCN 里实时预览主题（颜色/圆角/阴影等）对页面的影响，并把导出的 Theme Code 固化到项目里。

## 原理

- `index.html` 引入 `https://tweakcn.com/live-preview.min.js`
- 页面使用 shadcn 风格的 token：`:root`（亮色）+ `.dark`（暗色）
- 从 TweakCN 导出的 Theme Code 粘贴到 `UI change.css` 后，页面会加载它并覆盖 token

## Step by step：让 TweakCN 能打开你的本地页面

在线 editor 是 `https`，无法直接嵌入 `http://localhost:8000/`（Mixed Content / 服务器不可达），所以需要一个 `https` 的公网地址映射到本机。

1. 启动本地静态服务：
   ```bash
   python3 -m http.server 8000
   ```
2. 启动 HTTPS 隧道（LocalTunnel，需要 Node.js）：
   ```bash
   npx localtunnel --port 8000
   ```
3. 复制输出的 `https://xxxx.loca.lt`，先在浏览器新标签页打开一次：
   - 如果出现 **tunnel password** 页面：
     - 打开 `https://loca.lt/mytunnelpassword` 拿到公网 IP
     - 把这串 IP 输入 password
4. 打开 `https://tweakcn.com/editor/theme?p=custom&tab=other`：
   - Custom URL 粘贴你的 `https://xxxx.loca.lt/`
   - 现在切换左上角 theme（如 amber minimal）应会实时更新页面

## Step by step：把某个主题固化到项目

1. 在 TweakCN editor 里导出 Theme Code（CSS）
2. 用导出的 CSS 覆盖 `UI change.css`
3. 刷新你的页面（建议把 URL 从 `?v=1` 改成 `?v=2` 避免缓存）

可选：控制渐变终点颜色（让侧边栏/按钮渐变更符合你想要的风格）

```css
:root {
  /* 可以改成 var(--secondary) 或任意 oklch()/#hex */
  --ydp-gradient-to: var(--secondary);
}
```

## 常见问题

- **Custom URL 打不开 `http://localhost:xxxx`**：必须用隧道（LocalTunnel）或部署到 HTTPS（GitHub Pages / Vercel / Netlify）。
- **`503 - Tunnel Unavailable`**：localtunnel 进程掉了 / 本地服务停了；重启 `python3 -m http.server 8000` 和 `npx localtunnel --port 8000`，并更新 Custom URL。
- **主题不生效 / 看不到你导出的 CSS**：先打开 `https://xxxx.loca.lt/UI%20change.css`，确认返回内容是 CSS（不是 localtunnel 的密码页/提示页）。
- **`Error: Endpoint IP value is required.`**：常见是浏览器扩展（密码管理器等）注入输入框导致；用无痕窗口或禁用扩展后再输入 password。
