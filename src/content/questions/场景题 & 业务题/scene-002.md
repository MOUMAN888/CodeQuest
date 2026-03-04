---
id: scene-002
title: DOM 与 BOM 的区别与核心 API
difficulty: easy
tags: [dom, bom, browser]
category: scenario
---

## 🧩 题目

DOM 和 BOM 的区别与联系是什么？它们各自有哪些常见的核心 API？

---

## 💡 解题思路

1. DOM：文档对象模型，操作页面结构与内容
2. BOM：浏览器对象模型，操作浏览器窗口、历史、导航等
3. 联系：都挂在全局 `window` 下，BOM 提供入口，DOM 专注文档
4. 列举常见 API：`document.querySelector`、`addEventListener`、`location`、`history`、`navigator` 等

---

## ✅ 面试回答（标准版）

1. **概念区别**  
   - **DOM（Document Object Model）**：  
     - 是针对 HTML/XML 文档的编程接口，把页面结构抽象为一棵可操作的树状节点。  
     - 主要用于**操作页面内容和结构**：增删节点、修改属性、事件绑定等。  
   - **BOM（Browser Object Model）**：  
     - 是浏览器环境提供的一组对象，用于与浏览器窗口本身进行交互。  
     - 主要用于**控制浏览器行为和访问环境信息**，如窗口、导航、历史、地址栏等。  

2. **联系**  
   - 在浏览器中，全局对象是 `window`：  
     - DOM 的入口对象 `document` 是 `window.document`。  
     - BOM 中的 `location`、`history`、`navigator`、`screen` 等也都挂在 `window` 下。  
   - 可以简单理解为：**BOM 提供浏览器环境的能力，而 DOM 专门用于操作页面文档本身**。  

3. **DOM 的常见核心 API 示例**  
   - 获取元素：`document.getElementById`、`querySelector`、`querySelectorAll`、`getElementsByClassName` 等。  
   - 创建/修改节点：`document.createElement`、`appendChild`、`removeChild`、`classList.add/remove`、`setAttribute` 等。  
   - 事件绑定：`element.addEventListener('click', handler)`、`removeEventListener`。  
   - 测量与布局：`getBoundingClientRect`、`offsetWidth`、`clientHeight` 等。  

4. **BOM 的常见核心 API 示例**  
   - `window`：全局作用域、定时器（`setTimeout`、`setInterval`）等。  
   - `location`：当前 URL 信息，`location.href`、`location.assign`、`location.reload`。  
   - `history`：浏览历史栈控制，`history.back()`、`history.forward()`、`history.pushState()`。  
   - `navigator`：浏览器和设备信息，如 `navigator.userAgent`、`navigator.language`。  
   - `screen`：屏幕信息，`screen.width`、`screen.height`。  

一句话：DOM 是用来「改页面内容」的，BOM 是用来「跟浏览器这壳子打交道」的，它们共同构成了浏览器端 JS 的运行环境。  

