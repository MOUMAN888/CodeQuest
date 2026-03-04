---
id: react-008
title: 常用 React Hooks 的作用与使用场景
difficulty: medium
tags: [react, hooks, useState, useEffect, useMemo, useCallback, useRef]
category: react
---

## 🧩 题目

React 中常见的 Hooks（如 `useState`、`useEffect`、`useMemo`、`useCallback`、`useRef` 等）分别有什么作用？适合用在什么场景？

---

## 💡 解题思路

1. 分别简要说明每个 Hook 的用途
2. 对比 `useMemo` / `useCallback` 的缓存目标不同
3. `useRef` 的两大用途：持久化可变值、获取 DOM 引用
4. 强调「不要过度优化」，仅在确有性能问题或依赖稳定引用时使用 memo 类 Hook

---

## ✅ 面试回答（标准版）

1. **`useState`：声明组件内部状态**  
   - 用于在函数组件中声明本地状态：

   ```js
   const [count, setCount] = useState(0);
   ```

   - 触发 `setCount` 会安排一次重新渲染，新的 `count` 会参与下一次渲染逻辑  

2. **`useEffect`：处理副作用（异步、订阅、DOM 操作等）**  
   - 用于在渲染后执行副作用逻辑，例如数据请求、订阅事件、操作 DOM 等：

   ```js
   useEffect(() => {
     const id = setInterval(fetchData, 1000);
     return () => clearInterval(id); // 清理副作用
   }, [deps]);
   ```

   - 依赖数组控制执行时机：  
     - `[]`：只在首次挂载和卸载时运行  
     - `[a, b]`：在依赖变化时重新运行  

3. **`useMemo`：缓存计算结果**  
   - 适合**缓存开销较大的计算**结果，在依赖不变时复用：

   ```js
   const result = useMemo(() => heavyCompute(data), [data]);
   ```

   - 避免每次渲染都重复进行昂贵计算，但不要对微不足道的计算过度使用  

4. **`useCallback`：缓存回调函数引用**  
   - 用于在依赖不变时复用同一个函数引用，常配合 `React.memo`、`useEffect` 等避免不必要的子组件渲染或 effect 重新执行：

   ```js
   const handleClick = useCallback(() => {
     doSomething(id);
   }, [id]);
   ```

   - 本质上：`useCallback(fn, deps)` 等价于 `useMemo(() => fn, deps)`  

5. **`useRef`：持久化可变值 & 获取 DOM 引用**  
   - 两大常见用途：  
     1）**获取 DOM 元素引用**：

     ```js
     const inputRef = useRef(null);
     // 在 JSX 中绑定
     <input ref={inputRef} />;
     // 使用时：inputRef.current.focus();
     ```

     2）**跨渲染周期持久化可变值，但不会触发重新渲染**：

     ```js
     const timerRef = useRef(null);
     // 存放 setTimeout 的 id 等
     ```

6. **使用建议总结**  
   - `useState`：处理 UI 状态变化的基础 Hook  
   - `useEffect`：所有「渲染之外的副作用逻辑」基本都放这里，注意清理副作用，避免内存泄漏  
   - `useMemo` / `useCallback`：用于性能优化和稳定引用，应「按需使用」，不要为了「看起来专业」到处加  
   - `useRef`：在「不想因值变化而重新渲染」时存储值，以及与 DOM/第三方库交互时存放实例/节点引用  

理解每个 Hook 的定位和适用场景，有助于写出结构清晰、性能合理的函数组件。  

