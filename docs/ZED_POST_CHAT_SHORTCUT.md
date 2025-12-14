# Zed 一键发布（Post-chat）快捷方式

目标：你在 Zed 里做完一次需求对话后，只要运行一个 Task，就自动完成“写 Changelog + 版本号更新 + commit + push”。

## 你只需要做一次的设置（我已在项目里准备好）

本项目已经包含 Zed Tasks 配置文件：`.zed/tasks.json`，所以你不需要自己写 tasks。

## 第一次怎么用（小白步骤）

1. 在 Zed 打开这个项目（仓库根目录）。
2. 按 `Cmd+Shift+P` 打开命令面板（Command Palette）。
3. 输入 `task`，选择类似 **Run Task** 的命令。
4. 选择下面其中一个任务：
   - `Post-chat: Release (confirm)`：脚本会再问你一次 `y/N` 才执行发布。
   - `Post-chat: Release (--yes)`：不再问，直接发布（推荐：你在聊天里确认后用这个）。
   - `Post-chat: Dry run (no changes)`：只预览计划，不改文件、不提交。

## 以后每次对话结束，你怎么做 / 我会帮你做什么

1. 你：在这里写需求。
2. 我：在代码里把功能做完，并整理好一段“发布说明”（Added/Changed/Fixed）。
3. 你：看发布说明对不对；对就回“确认发布”，不对就让我改发布说明。
4. 你：在 Zed 里运行 `Post-chat: Release (--yes)`（或用 confirm 版本）。
5. 脚本：自动更新 `CHANGELOG.md`、更新版本号（`index.html` / `data.json`）、`git commit`、`git push`。

## 想把快捷方式用到别的项目（最简单）

每个项目需要两样东西：
- 该项目里也有 `scripts/post-chat.mjs`（你可以把这份文件复制过去，或以后我们做成全局工具）。
- 该项目里也放一份 `.zed/tasks.json`（可以把本项目的 `.zed/tasks.json` 复制过去）。

