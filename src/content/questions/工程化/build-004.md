---
id: build-004
title: 前端打包体积优化方案
difficulty: medium
tags: [bundle, optimization, performance]
category: engineering
---

## 🧩 题目

在前端项目中如何优化打包体积？请列举常用的具体方案和可用的工具。

---

## 💡 解题思路

1. 可视化 & 分析：使用 `webpack-bundle-analyzer` 等工具找大头
2. 代码层面：Tree Shaking、按需加载、拆分路由/组件、减少 polyfill
3. 依赖管理：替换重型库、拆分 vendor、使用 CDN/外链
4. 资源优化：压缩图片、使用现代格式、开启 gzip/br brotli

---

## ✅ 面试回答（标准版）

可以按「**先分析 → 再优化代码与依赖 → 再优化资源与传输**」的思路来回答。  

1. **先分析：找出体积大头**  
   - 使用打包分析工具查看 bundle 构成：  
     - Webpack：`webpack-bundle-analyzer`、`source-map-explorer`  
     - Vite/Rollup：`rollup-plugin-visualizer`、Vite 内置分析插件  
   - 分析结果可以帮助你判断：是业务代码太多、第三方库过重、还是静态资源占比过大。  

2. **代码与模块层面的优化**  
   - **Tree Shaking**：  
     - 保证使用 ES Module 语法（`import/export`），在生产模式下启用 Tree Shaking。  
     - 对有副作用的模块正确标记 `sideEffects`，避免误删。  
   - **按需引入与代码分割（Code Splitting）**：  
     - 对路由使用懒加载：  

     ```js
     const Page = React.lazy(() => import('./Page'));
     ```

     - 只在需要时加载特定组件或页面，减少首屏 bundle 体积。  
   - **减少不必要的 Polyfill**：  
     - 使用基于业务目标浏览器的按需 Polyfill（如 core-js + `useBuiltIns: 'usage'`），而不是一次性引入完整 Polyfill。  
   - **删除死代码与调试信息**：  
     - 利用 Terser/UglifyJS 删除未使用代码（Dead Code）、`console.log`、调试辅助逻辑。  

3. **依赖与库选择优化**  
   - **替换重型依赖**：  
     - 用更轻量库替换大体积库，例如：  
       - `moment` → `dayjs` / 原生 `Intl.DateTimeFormat`  
       - 整个 UI 库 → 按需引入组件或自研少量基础组件  
   - **按需加载 UI 库组件**：  
     - 配合 Babel 插件（如 `babel-plugin-import`）或官方按需引入方式，避免一次性打进整个组件库。  
   - **利用 CDN 与 external**：  
     - 将 React/Vue 等稳定第三方库通过 CDN 引入，在打包配置中将其标记为 `external`，不再打进 bundle。  

4. **静态资源与传输优化**  
   - **图片优化**：  
     - 压缩图片（ImageOptim、tinypng 等），使用合适分辨率和格式（WebP/AVIF 等）。  
     - 使用雪碧图或 Icon Font/SVG Sprite 减少小图数量。  
   - **CSS/JS 压缩与拆分**：  
     - 启用生产模式下的压缩插件（TerserPlugin、CssMinimizerPlugin 等）。  
     - 合理拆分出共享 chunk（`splitChunks`），提升缓存利用率。  
   - **开启压缩传输**：  
     - 在服务端/Nginx 层启用 `gzip` 或 `brotli` 压缩，减小网络传输体积。  

5. **缓存与长期缓存策略**  
   - 使用 **内容哈希（contenthash）作为文件名**，结合 HTTP 缓存头（`Cache-Control: max-age=31536000`）实现长效缓存。  
   - 将不常变的第三方库与业务代码分离，减少用户重新下载的体积。  

总结：优化打包体积不只是「点几下配置」，而是从代码、依赖、静态资源、网络传输和缓存多个层面综合治理，先用工具分析，再针对问题点逐一优化。  

