---
id: build-001
title: Webpack 的 HMR 原理与配置
difficulty: medium
tags: [webpack, hmr, dev-experience]
category: engineering
---

## 🧩 题目

Webpack 的 HMR（热模块替换）是什么？它的底层实现原理大致如何？在项目中通常需要如何配置才能启用 HMR？

---

## 💡 解题思路

1. 定义：在不刷新整个页面的前提下替换模块代码，保留运行状态
2. 原理：dev server 维护 WebSocket 连接，监听文件变化 → 重新编译模块 → 向客户端推送更新信息 → runtime 下载更新 chunk → 调用 module.hot API 更新
3. 配置：`devServer.hot`、`module.hot.accept` 或框架封装（如 React Refresh）

---

## ✅ 面试回答（标准版）

1. **HMR 是什么？**  
   - HMR（Hot Module Replacement，热模块替换）是 Webpack 提供的一种**在运行时替换已加载模块**的机制。  
   - 与「整个页面刷新」不同，HMR 可以只更新发生变化的模块，同时**尽量保留应用的运行状态**（比如 React 组件的本地 state、页面滚动位置等），显著提升开发体验。  

2. **底层实现原理简要说明**  
   结合 `webpack-dev-server` 或 `webpack-dev-middleware` 的典型流程可以概括为：  
   1）开发服务器监听源文件变化（使用 `chokidar` 等文件监听库）。  
   2）文件改动后，Webpack 重新编译，生成新的模块和对应的「热更新补丁」文件（hot update chunk + manifest）。  
   3）Dev Server 通过 **WebSocket**（或 SSE）向浏览器发送「某个模块发生了更新」的消息（包含 hash、变更列表等）。  
   4）浏览器端的 Webpack runtime 收到消息后，会按需再通过 HTTP 请求下载对应的热更新 chunk。  
   5）下载完成后，runtime 根据 manifest 中的信息，找到需要替换的模块，触发 `module.hot.accept` 注册的回调，执行模块替换逻辑：  
      - 卸载旧模块的代码，保留必要的运行状态（由业务/框架层决定）  
      - 加载并执行新模块，更新依赖关系图  
   6）若某个模块没有正确处理 HMR（没有 `accept`），更新会沿依赖链向上冒泡，最终可能回退到整页刷新。  

3. **在项目中如何配置 HMR？**  
   - **基础配置**（以 Webpack 4/5 为例）：  

   ```js
   // webpack.config.js
   module.exports = {
     // ...
     devServer: {
       hot: true,           // 启用 HMR
       liveReload: false,   // 可选择关闭纯刷新
     },
     plugins: [
       new webpack.HotModuleReplacementPlugin(), // Webpack 5 多数场景可省略
     ],
   };
   ```

   - **业务代码中处理模块更新**（裸 Webpack 时）：  

   ```js
   if (module.hot) {
     module.hot.accept('./someModule', () => {
       // 重新 require 新代码并替换逻辑
     });
   }
   ```

   - 在实际项目中（如 React/Vue），通常通过脚手架或插件封装好：  
     - React：使用 `react-refresh-webpack-plugin` 或 CRA 内置配置  
     - Vue：`vue-loader` / `@vitejs/plugin-vue` 等会自动处理组件级 HMR  

4. **总结**  
   - HMR 的核心是「**通过 WebSocket 通知 + 按需下载更新模块 + runtime 替换模块**」，从而在不刷新页面的前提下热更新代码。  
   - 在现代前端开发中，HMR 几乎是本地开发服务器的标配，提升了迭代效率和调试体验。  

