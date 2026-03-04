---
id: other-005
title: 使用浏览器开发者工具进行 JS 单步调试
difficulty: easy
tags: [debug, devtools]
category: other
---

## 🧩 题目

如何使用浏览器开发者工具（以 Chrome 为例）对 JavaScript 代码进行单步调试？有哪些常用的调试技巧和功能？

---

## 💡 解题思路

1. 介绍 Sources 面板：打断点、单步执行、查看调用栈、监视变量
2. 技巧：条件断点、XHR/fetch 断点、DOM 断点、`debugger` 语句
3. 提到 Source Map 与本地映射

---

## ✅ 面试回答（标准版）

1. **基本单步调试流程**  
   - 打开 Chrome DevTools（F12 或右键检查）。  
   - 切换到 **Sources** 面板：  
     - 在左侧文件树中找到对应的 JS/TS 文件（若使用 Source Map，会显示源码路径）。  
     - 在代码行号区域单击，添加断点。  
   - 触发相关页面操作（刷新页面或点击按钮）让代码运行到断点处。  
   - 使用工具栏上的控制按钮：  
     - **Continue / Resume**（F8）：继续执行到下一个断点。  
     - **Step over**（F10）：单步执行当前行，遇到函数调用时不进入内部。  
     - **Step into**（F11）：进入函数内部逐行调试。  
     - **Step out**（Shift+F11）：跳出当前函数，回到上层调用。  

2. **查看变量与调用栈**  
   - 在暂停状态下：  
     - **Scope** 面板查看当前作用域链中的变量值。  
     - **Call Stack** 面板查看当前执行栈，了解函数调用路径。  
     - 鼠标悬停在代码里的变量名上即可查看当前值。  
     - 使用 **Watch** 功能添加表达式，实时观察表达式值变化。  

3. **常用调试技巧**  
   - **条件断点**：  
     - 右键行号 → Add conditional breakpoint，设置触发条件（如 `index === 10`），只有条件满足时才中断。  
   - **XHR/fetch 断点**：  
     - 在 Sources → XHR/fetch Breakpoints 中添加某个 URL 关键字，当匹配的请求发出时自动断在发送前。  
   - **DOM 断点**：  
     - 在 Elements 面板中选中某个节点，右键选择「Break on」→ 属性修改 / 子树修改 / 节点移除。  
   - **使用 `debugger` 语句**：  
     - 在代码中插入 `debugger;`，当 DevTools 打开时运行到此处会自动暂停。  

4. **Source Map 与本地文件映射**  
   - 在打包项目中启用 Source Map，可以在 DevTools 中直接调试 TypeScript/ES6 源码，而不是编译后的 bundle。  
   - 也可以使用 Workspaces / Overrides 将本地文件与线上资源映射，方便线上调试与临时修改。  

总结：熟练使用 DevTools 的断点、单步执行、调用栈和变量监视功能，是前端工程师定位问题和理解复杂逻辑的核心技能之一。  

