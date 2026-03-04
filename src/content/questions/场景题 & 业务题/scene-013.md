---
id: scene-013
title: 组件库深色模式与主题系统设计
difficulty: medium
tags: [design-system, theming, dark-mode]
category: scenario
---

## 🧩 题目

如果让你为一套组件库实现深色模式，你会如何设计主题系统？如何优雅地切换主题色，并尽量减少对使用者的配置负担？

---

## 💡 解题思路

1. 主题抽象：Design Tokens（颜色、字号、间距、阴影）、语义化变量
2. 技术实现：CSS 变量、`data-theme` 切换、支持深色/浅色/品牌色
3. 减少配置负担：提供默认主题与少量可配置项、自动适配系统主题（prefers-color-scheme）

---

## ✅ 面试回答（标准版）

1. **从 Design Tokens 开始抽象主题**  
   - 不直接在组件里写死具体颜色值，而是定义一套 **语义化的 Design Tokens**：  
     - 颜色：`--color-bg`, `--color-bg-elevated`, `--color-text-primary`, `--color-border`, `--color-primary` 等。  
     - 其他：字号、行高、圆角、阴影、间距等。  
   - 在浅色/深色模式下，这些 Token 的具体值不同，但语义一致（如「主背景」「强调文字」）。  

2. **使用 CSS 变量实现主题切换**  
   - 在根元素上定义不同主题下的 CSS 变量：  

   ```css
   :root[data-theme='light'] {
     --color-bg: #ffffff;
     --color-text-primary: #1f2933;
     --color-primary: #2563eb;
   }

   :root[data-theme='dark'] {
     --color-bg: #111827;
     --color-text-primary: #e5e7eb;
     --color-primary: #3b82f6;
   }
   ```

   - 组件内部统一使用这些变量：  

   ```css
   .btn {
     background-color: var(--color-primary);
     color: var(--color-text-on-primary);
   }
   ```

   - 切换主题只需在顶层切换 `data-theme` 属性（或 class），无需逐个组件改样式。  

3. **优雅切换主题色与减少用户配置负担**  
   - **默认提供一套浅色 + 深色主题**：  
     - 大部分用户直接使用默认配置即可。  
   - **少量可配置入口**：  
     - 允许使用者通过 JS 接口覆写少量关键 Token（如品牌主色）：  

     ```js
     setTheme({ primary: '#ff4d4f' });
     ```

     - 内部将品牌主色扩展为不同明度与用途（primaryLight、primaryDark、hoverColor 等），减轻使用者负担。  
   - **自动适配系统主题**：  
     - 利用 `@media (prefers-color-scheme: dark)` 或 JS API 检测系统暗色模式，默认跟随系统，并提供手动切换覆盖。  

4. **状态持久化与渐进增强**  
   - 将用户选择的主题存储在 `localStorage` 或 Cookie 中，页面刷新后恢复。  
   - 在支持 CSS 变量的浏览器上使用上述方案，对老旧环境可提供降级样式或不支持主题切换。  

5. **总结**  
   - 深色模式的关键在于「**语义化设计 Token + CSS 变量 + 顶层切换**」，组件内部全部依赖 Token，而不是硬编码色值。  
   - 通过提供默认主题、少量可配置项和系统主题适配，可以在保证灵活性的同时尽量减少使用者的配置成本。  

