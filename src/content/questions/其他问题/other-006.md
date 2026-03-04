---
id: other-006
title: React/Vue 中连续 setState 加 1 的结果与原因
difficulty: medium
tags: [react, vue, state-batching]
category: other
---

## 🧩 题目

在 React 或 Vue 中，如果连续两次对同一个 state 执行「加 1」操作，例如：

```js
setCount(count + 1);
setCount(count + 1);
```

最终结果通常是多少？为什么会出现这种情况？如何写才能确保真正加 2？

---

## 💡 解题思路

1. 状态更新是批量的，闭包中的 `count` 值是旧值
2. React：批处理更新，需要使用函数式更新 `setCount(prev => prev + 1)`
3. Vue：`this.count++` 连续调用生效，解释依赖跟踪与 flush 时机

---

## ✅ 面试回答（标准版）

1. **React 中的情况（以 Hooks 为例）**  

```js
// 初始 count = 0
setCount(count + 1);
setCount(count + 1);
```

   - 在一次事件回调中，`count` 的值在闭包中是**固定的旧值**（比如 0），两次调用实际上都等价于 `setCount(1)`。  
   - 由于 React 会对 state 更新进行 **批处理和合并**，最终只会应用一次 `count = 1`，而不是 2。  
   - 想要真正加 2，应采用 **函数式更新**：  

```js
setCount(prev => prev + 1);
setCount(prev => prev + 1); // 最终得到 count + 2
```

   - 函数式更新中的 `prev` 始终是「上一次更新后的最新值」，不会受闭包旧值影响。  

2. **Vue 中的情况（以 Options API 为例）**  

```js
// 初始 this.count = 0
this.count++;
this.count++;
```

   - 在 Vue 中，对响应式数据的直接自增（`this.count++`）会直接修改数据对象，最终结果通常是 `count + 2`。  
   - Vue 的响应式系统会在异步 flush 阶段统一触发视图更新，但数据本身已经是最新值了。  
   - 若在 Composition API 中通过 `ref` 使用，也类似：  

```js
count.value++;
count.value++; // 最终加 2
```

3. **总结与写法建议**  
   - **React**：  
     - 连续多次基于旧 state 的更新，推荐使用函数式更新 `setState(prev => prev + delta)`，避免闭包捕获旧值和批量更新导致的误差。  
   - **Vue**：  
     - 连续操作响应式状态时直接修改 `this.count` / `ref.value` 即可，理解更新批量发生在「视图层」，而不是数据层。  

本质上，React 的 state 更新是「**不可变 + 批处理 + 基于旧值创建新值**」，函数式更新可以精确描述「基于上一个状态计算下一个状态」；而 Vue 使用的是「可变响应式对象」，多次自增会直接反映在数据上。  

