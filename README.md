# CodeQuest

解构代码逻辑，重塑思维边界 —— 面向前端开发的面试刷题应用。


## 🌐 预览地址

你可以通过以下链接访问 Manji 应用的在线预览：

[CodeQuest预览地址](http://code.mouman.top)

> 注：此预览地址仅供演示，可能会有数据更新延迟或功能限制。


## 功能特性

- **分类刷题**：HTML、CSS、JavaScript、Vue、React 等分类，按 Markdown 题目文件组织
- **进度持久化**：每个分类的刷题进度自动保存，再次进入时跳转到上次位置
- **主题切换**：支持暗色 / 亮色主题，偏好持久化到本地
- **AI 助手**：侧边 AI 面板，刷题过程中可随时提问，支持 Markdown 回复与打字机效果
- **代码雨背景**：首页动态代码雨背景，随主题变化

## 技术栈

- **Vue 3** + **Vite 7** + **TypeScript**
- **Pinia** 状态管理
- **Vue Router** 路由
- **Axios** 请求
- **Marked** Markdown 渲染

## 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发

```bash
npm run dev
```

访问 `http://localhost:5173`。

### 构建

```bash
npm run build
```

产物在 `dist/` 目录。

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
src/
├── api/           # API 封装（如 chat）
├── assets/        # 静态资源、主题样式
├── components/    # 公共组件（AIPanel、TopControls、CodeRainCanvas）
├── content/       # 题目 Markdown 文件
│   └── questions/
│       ├── html/
│       ├── css/
│       ├── js/
│       ├── vue/
│       └── react/
├── router/        # 路由配置
├── stores/        # Pinia 状态（theme、ui、quizProgress）
├── utils/         # 工具函数（questionLoader、markdown）
├── views/         # 页面视图（HomeView、QuizView）
├── App.vue
└── main.ts
```

## 题目格式

题目存放在 `src/content/questions/{category}/` 下，为 Markdown 文件，需包含 frontmatter：

```yaml
---
id: html-001
title: 题目标题
difficulty: easy
tags: [html, standard]
category: html
---

## 🧩 题目

题目描述...

---

## 💡 解题思路

思路内容...

---

## ✅ 面试回答（标准版）

标准回答...
```

## AI 助手

AI 面板通过 `POST /chat` 与后端通信，请求体 `{ message: string }`，响应 `{ reply: string, success: boolean }`。

- **本地开发**：默认请求 `http://localhost:8000/chat`，需自行启动后端

## 脚本说明

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 类型检查 + 构建 |
| `npm run preview` | 预览构建产物 |
| `npm run format` | 格式化 `src/` 代码 |

## License

Private
