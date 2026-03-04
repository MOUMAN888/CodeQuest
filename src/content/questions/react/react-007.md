---
id: react-007
title: React Hooks 使用规则与常见坑
difficulty: medium
tags: [react, hooks, rules]
category: react
---

## 🧩 题目

React Hooks 可以在任意位置使用吗？请说明使用 Hooks 的两条基本规则，以及在实际开发中常见的坑点有哪些。

---

## 💡 解题思路

1. 再次强调两条官方规则：只在最顶层调用，只在函数组件或自定义 Hook 中调用
2. 解释为什么：React 通过「调用顺序」记录 Hook 状态
3. 列举常见坑：条件/循环中调用 Hook、在普通函数/回调中调用 Hook、依赖数组写错导致 useEffect/useCallback/useMemo 行为异常
4. 提到 ESLint 插件 `eslint-plugin-react-hooks` 辅助检查

---

## ✅ 面试回答（标准版）

1. **Hooks 的两条基本使用规则**  
   React 官方给出的两条规则非常重要：  
   - **只在最顶层调用 Hook**：不要在循环、条件判断或嵌套函数中调用 `useState`、`useEffect` 等  
   - **只在 React 函数组件或自定义 Hook 中调用 Hook**：不要在普通的 JS 函数、类组件、事件回调中直接调用 Hook  

   根本原因是：**React 通过「Hook 的调用顺序」来维护每个 Hook 对应的状态槽**。一旦调用顺序不稳定（比如有条件分支导致某次渲染多/少调用一个 Hook），后面的 Hook 就会「错位」，拿到错误的 state 或 effect。  

2. **常见坑点 1：在条件、循环或内部函数中调用 Hook**  

```js
if (visible) {
  const [count, setCount] = useState(0); // ❌
}
```

   - 当 `visible` 从 `true` 变为 `false` 时，这个 Hook 不再被调用，后续所有 Hook 状态「向前移动一位」，导致严重 bug  
   - 正确做法是：**始终在组件顶层按固定顺序声明所有 Hook**，条件逻辑放在 Hook 内部或通过提前 return 渲染结果来处理  

3. **常见坑点 2：在普通函数或回调中调用 Hook**  

```js
function doSomething() {
  const [count] = useState(0); // ❌ 不是组件或自定义 Hook
}
```

   - Hook 只能在 React 渲染过程中调用，React 需要在「函数组件执行时」知道有哪些 Hook 参与渲染  
   - 如需抽离逻辑，应封装成**自定义 Hook**，函数名以 `use` 开头：  

```js
function useSomething() {
  const [count] = useState(0);
  return count;
}
```

4. **常见坑点 3：依赖数组写错导致 useEffect/useMemo/useCallback 异常**  
   - 忽略某些依赖 → 导致闭包捕获旧值、逻辑不随 props/state 更新  
   - 过度依赖每个 render 生成的新引用（如匿名函数、对象字面量） → 使得 `useEffect` 每次 render 都重新执行  
   - 建议：  
     - 启用 ESLint 插件 `eslint-plugin-react-hooks`，严格遵循提示  
     - 对依赖数组保持「**写全写对**」的原则，而不是随意忽略警告  

5. **总结**  
   - Hook 不能在任意位置使用，必须遵守调用规则以保证「调用顺序」稳定  
   - 大部分与 Hook 相关的 bug 都可以归结为：**调用位置不对 或 依赖数组错误**  
   - 配合官方 ESLint 规则可以在编码阶段尽早发现这些问题。  

