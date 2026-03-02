---
id: react-001
title: React 中的虚拟 DOM
difficulty: medium
tags: [react, vdom]
category: react
---

## 🧩 题目

什么是虚拟 DOM？React 为什么要使用虚拟 DOM？

---

## 💡 解题思路

1. 虚拟 DOM 是真实 DOM 的 JS 对象表示
2. 每次状态变更先生成新虚拟树，再与旧树 diff
3. 只对差异部分做最小化真实 DOM 更新

---

## ✅ 面试回答（标准版）

虚拟 DOM（Virtual DOM）可以理解为用 JavaScript 对象描述真实 DOM 结构的一层抽象。React 在状态更新时不会立刻操作真实 DOM，而是先根据最新状态生成一棵新的虚拟 DOM 树，再与上一次的虚拟树进行 diff，对比出哪些节点发生变化，最后再把这些差异映射到真实 DOM 上。这样可以把大量、复杂的 DOM 操作收敛成一次批量更新，降低重排重绘频率，同时带来更清晰的声明式编程模型。

