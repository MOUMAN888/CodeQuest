---
id: react-009
title: 手写实现类似 useCallback 的 useMemo 钩子
difficulty: medium
tags: [react, hooks, custom-hook]
category: react
---

## 🧩 题目

如何手写实现一个类似 `useCallback` 的自定义 `useMemo` 钩子？它的底层原理是什么？（可从「根据依赖决定是否复用上一次结果」的角度来说明）

---

## 💡 解题思路

1. 回顾 `useMemo(fn, deps)` 与 `useCallback(fn, deps)` 的关系：前者缓存值，后者缓存函数引用
2. 说明简单实现思路：在闭包中保存上一次的依赖数组和结果值，每次调用比较依赖是否变化
3. 给出简化版本的实现伪代码，强调依赖比较与缓存数组
4. 强调真正的 React Hook 是由 React 内部管理 Hook 列表和下标，这里只是模拟其核心思想

---

## ✅ 面试回答（标准版）

1. **先理解官方 Hook 的语义**  
   - `useMemo(factory, deps)`：  
     - 当依赖 `deps` 不变时，**复用上一次计算出来的结果值**  
     - 当依赖变化时，重新执行 `factory` 计算，并缓存新的结果  
   - `useCallback(fn, deps)` 本质上就是对「函数值」做 `useMemo`：  

   ```js
   const memoizedFn = useCallback(fn, deps);
   // 等价于：
   const memoizedFn2 = useMemo(() => fn, deps);
   ```

2. **手写一个极简版 useMemo**  
   在真正的 React 中，Hook 状态是挂在 Fiber 上，通过「当前 Hook 索引」管理的。我们可以用一个数组和一个指针来模拟这一行为，重点是理解「**记住上一次的 deps 和 value**」这一点：  

   ```js
   // 极简、仅用于理解原理的实现
   let hookIndex = 0;
   const hooks = [];

   function useMyMemo(factory, deps) {
     const prevHook = hooks[hookIndex];

     if (prevHook) {
       const [prevValue, prevDeps] = prevHook;
       const depsUnchanged =
         deps && prevDeps && deps.length === prevDeps.length &&
         deps.every((d, i) => Object.is(d, prevDeps[i]));

       if (depsUnchanged) {
         // 依赖未变，直接复用之前的值
         hookIndex++;
         return prevValue;
       }
     }

     // 依赖变化或第一次调用，重新计算
     const nextValue = factory();
     hooks[hookIndex] = [nextValue, deps];
     hookIndex++;
     return nextValue;
   }
   ```

   - 这里用 `hooks` 数组模拟「每个 Hook 对应一格状态槽」，`hookIndex` 模拟本次渲染的 Hook 调用顺序  
   - 每次 `useMyMemo` 调用都会拿到对应位置上一次的 `[value, deps]`，并与本次的 `deps` 做浅比较  
   - 若依赖没变，则直接返回上一次缓存的 `value`；否则重新计算并更新缓存  

3. **基于 useMyMemo 实现类似 useCallback**  

```js
function useMyCallback(fn, deps) {
  return useMyMemo(() => fn, deps);
}
```

   - 这样就可以在依赖不变时复用同一个函数引用，以配合 `React.memo` 和子组件优化  

4. **原理总结**  
   - 真正的 React Hook 并不是像上面的代码那样全局存一个数组，而是将「Hook 状态」挂在 Fiber 节点上，并通过当前渲染过程中的 Hook 调用顺序来取/存状态  
   - 自定义 Hook（如这里的 `useMyMemo` / `useMyCallback`）的核心思想是：**在 Hook 内部维护一些跨渲染周期的状态和依赖信息，根据依赖是否变化来决定是复用还是重新计算**  

一句话：不管是 `useMemo` 还是 `useCallback`，本质都是「**记住上一次的结果 + 比较依赖数组**」，决定是否需要重新计算，手写实现就是在一个受控的「Hook 状态存储」结构中复现这个逻辑。

