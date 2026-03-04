---
id: other-012
title: React Hooks 的核心概念、使用场景与常见坑
difficulty: medium
tags: [react, hooks]
category: other
---

## 🧩 题目

React Hooks 的核心概念是什么？常见 Hooks（如 `useState`、`useEffect` 等）适用于哪些场景？在使用 Hooks 的过程中你遇到过哪些坑，如何避免？

---

## 💡 解题思路

1. Hooks 核心：在函数组件中使用 state 与副作用，取代类组件部分能力
2. 使用场景：局部状态、共享逻辑（自定义 Hook）、副作用管理、性能优化
3. 坑点：依赖数组错误、闭包陷阱、调用顺序规则、useEffect 清理

---

## ✅ 面试回答（标准版）

1. **Hooks 的核心概念**  
   - Hooks 是 React 在函数组件中使用 state 和其他 React 特性的方式，本质是「**让函数组件具备状态和生命周期能力**」。  
   - 常见 Hooks：  
     - `useState`：管理组件内部状态。  
     - `useEffect`：处理副作用（数据请求、订阅、DOM 操作等）。  
     - `useMemo` / `useCallback`：性能优化与稳定引用。  
     - `useRef`：持久化可变值、获取 DOM 引用。  
   - 核心规则：  
     - 只能在函数组件或自定义 Hook 的最顶层调用 Hooks。  
     - 不要在循环、条件、嵌套函数中调用 Hook，以保证调用顺序稳定。  

2. **常见 Hooks 使用场景示例**  
   - `useState`：表单输入控制、Tab 切换状态、弹窗显隐等局部 UI 状态。  
   - `useEffect`：  
     - 组件挂载时请求数据（`[]` 依赖）。  
     - 监听某个 props/state 变化并执行副作用或与外部系统同步（有依赖数组）。  
     - 注册/清理订阅与事件监听。  
   - `useMemo` / `useCallback`：  
     - 缓存计算结果或函数引用，避免在依赖不变时重复计算或导致子组件不必要重渲染。  
   - 自定义 Hooks：  
     - 抽离复用逻辑（如 `useFetch`、`useDebounce`、`usePrevious`），在多个组件中共享。  

3. **常见坑点与规避方式**  
   - **依赖数组遗漏或误写**：  
     - 忘记将某些依赖加到 `useEffect`/`useCallback`/`useMemo` 的依赖数组中，导致闭包中的变量是旧值，引发逻辑错误。  
     - 解决：启用 `eslint-plugin-react-hooks`，遵循其提示，保证依赖数组完整；如有刻意忽略，必须有充分理由。  
   - **闭包陷阱**：  
     - 在 Effect 或回调中引用旧的 state/props：  

     ```js
     useEffect(() => {
       const id = setInterval(() => {
         console.log(count); // 可能是旧值
       }, 1000);
       return () => clearInterval(id);
     }, []); // 依赖数组为空
     ```

     - 解决：将依赖加入数组，或使用函数式更新与 `useRef` 存最新值。  
   - **Hook 调用顺序被破坏**：  
     - 在条件分支内调用 `useState` 或 `useEffect`，导致不同渲染间 Hook 调用数不一致，触发 React 警告或异常。  
     - 解决：始终在组件最外层按固定顺序调用 Hook，将条件分支放在 Hook 内部或渲染逻辑中。  
   - **过度使用 `useMemo` / `useCallback`**：  
     - 为几乎没有计算成本的逻辑添加大量 memo 化，反而增加心智负担和微小性能开销。  
     - 解决：仅在确认存在性能问题或需稳定引用（依赖相等性比较）时使用。  

4. **总结**  
   - Hooks 核心在于用「函数 + Hook 状态槽」取代类组件的 this/state/lifecycle，使逻辑复用与组合更自然。  
   - 实践中要重点注意依赖数组与调用顺序规则，配合 ESLint 插件和良好习惯，可以避免 80% 以上的 Hook 相关坑。  

