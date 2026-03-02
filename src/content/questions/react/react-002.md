---
id: react-002
title: React Hooks 的使用规则
difficulty: medium
tags: [react, hooks]
category: react
---

## 🧩 题目

React Hooks 有哪些基本使用规则？为什么「不能在条件语句或循环中调用 Hook」？

---

## 💡 解题思路

1. 只能在函数最外层调用 Hook，不能放在 if / for / 内部函数里
2. 只能在 React 函数组件或自定义 Hook 中调用 Hook
3. React 通过「调用顺序」来关联 Hook 状态
4. 一旦顺序不稳定（条件分支），就会导致状态错位

---

## ✅ 面试回答（标准版）

React 官方总结了两条 Hook 使用规则：  
1）**只在最顶层调用 Hook**，不要在循环、条件判断或嵌套函数中调用；  
2）只在 React 的函数组件或自定义 Hook 中调用 Hook。  
原因在于，React 是通过「Hook 的调用顺序」来记录每个 Hook 对应的状态的：第一次渲染时会按顺序建立一组状态槽，后续每次渲染都假定 Hook 的调用顺序是一致的。如果把 `useState` 或 `useEffect` 放进 `if` 里，当条件变化导致调用次数不同，就会让后面的 Hook 都错位，出现「某个组件拿到了别的组件的状态」这类非常难排查的问题。所以遵守规则，本质上是保证 Hook 调用顺序在每次渲染中都稳定一致。

