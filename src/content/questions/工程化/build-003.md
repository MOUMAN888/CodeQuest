---
id: build-003
title: Webpack 构建流程与 Tree Shaking 原理
difficulty: medium
tags: [webpack, build-flow, tree-shaking]
category: engineering
---

## 🧩 题目

请详细讲解 Webpack 的构建流程，包括从入口文件到产出 bundle 的主要阶段。Tree Shaking 的实现原理是什么？要生效需要满足哪些条件？

---

## 💡 解题思路

1. Webpack 构建流程：初始化参数 → 创建 Compiler → 确定入口 → 递归解析模块 → Loader 处理 → Plugin 钩子 → 生成 chunk 与输出文件
2. Tree Shaking：基于 ES Module 的静态分析，标记未被使用的导出并交给压缩器删除
3. 条件：使用 ES Module 语法、无副作用、在生产模式下启用压缩/优化配置（sideEffects、usedExports）

---

## ✅ 面试回答（标准版）

1. **Webpack 构建流程概览**  
   可以分成「配置解析 → 编译构建 → 生成输出」三个阶段：  
   - **初始化阶段**：  
     1）读取合并配置（`webpack.config.js` + CLI 参数），生成最终配置对象。  
     2）创建 `Compiler` 实例，注册各类插件（Plugin），准备好生命周期钩子。  
   - **编译阶段**：  
     3）从入口（`entry`）出发，解析依赖图：  
        - 解析入口模块 → 调用对应的 Loader 对源码做转换（如 Babel、CSS Loader 等）。  
        - 分析模块中的 `import`、`require` 等语句，递归解析依赖模块。  
     4）每解析一个模块，都经过「**Loader 链**」处理后生成标准的 JS 模块描述，加入依赖图中。  
     5）在整个过程中，Plugin 可以通过 Tapable 钩子（如 `compilation`、`emit`）插入自定义逻辑（如压缩、资源拷贝、分析）。  
   - **生成阶段**：  
     6）根据依赖图将模块分组成若干 **chunk**（入口 chunk、异步 chunk 等）。  
     7）将每个 chunk 渲染为最终的 bundle 文件（JS/CSS 等），输出到 `output` 目录。  

2. **Tree Shaking 的原理**  
   - Tree Shaking 本质是「**消除未使用的代码（Dead Code Elimination）**」，让打包结果只包含真正被用到的导出。  
   - Webpack 依赖 **ES Module 的静态结构** 来做分析：  
     - ES Module 的 `import` / `export` 必须在顶层，不能动态改变，这使得编译阶段就能知道哪些导出被引用。  
     - Webpack 在构建阶段会标记每个模块的导出是否被其他模块使用（`usedExports`）。  
   - 在生成阶段，配合压缩工具（如 Terser）：  
     - 对被标记为「未使用」的导出进行删除或「摇掉」，从而减小 bundle 体积。  

3. **Tree Shaking 生效的前提条件**  
   - **使用 ES Module 语法**：  
     - 必须使用 `import` / `export`，不能用 CommonJS 的 `require` / `module.exports`（后者是运行时动态的，不利于静态分析）。  
   - **开启生产模式与优化选项**：  
     - 在 `mode: 'production'` 下，Webpack 默认启用 Tree Shaking 相关优化和代码压缩。  
     - 确保 `optimization.usedExports`、`minimize` 等选项未被关闭。  
   - **正确标记副作用（sideEffects）**：  
     - 在 `package.json` 或配置中使用 `sideEffects` 字段，声明哪些文件/模块存在副作用，避免被误删：  

     ```json
     {
       "sideEffects": false
     }
     ```

     - 若某些模块在引入时会执行全局副作用（如修改全局变量），需要将其列入白名单，防止被 Tree Shaking 移除。  
   - **代码本身需可安全删除**：  
     - Tree Shaking 只能安全地删除「纯导出、无副作用」的代码段。  

4. **实践中的注意点**  
   - 对第三方库，优先选择提供 ESM 版本的包（如 `module` 字段），并尽量按需导入。  
   - 对自己的组件/工具库，采用 ESM 导出并合理配置 `sideEffects`，有助于被下游项目的 Tree Shaking 利用。  

一句话：Webpack 构建流程是从入口出发建立依赖图并输出 chunk 的过程，而 Tree Shaking 是在此基础上利用 ES Module 静态分析来标记和删除未使用导出，从而减小最终 bundle 体积。  

