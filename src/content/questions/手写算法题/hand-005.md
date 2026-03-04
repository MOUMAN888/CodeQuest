---
id: hand-005
title: 实现支持灵活传参的函数柯里化
difficulty: medium
tags: [javascript, curry, functional]
category: algorithm
---

## 🧩 题目

实现一个通用的函数柯里化工具 `curry(fn)`，要求：

1. 支持类似 `add(1)(2)(3)` → `6`  
2. 支持 `add(1, 2)(3)`、`add(1)(2, 3)` 等灵活传参方式  
3. 允许在参数收集过程中多次调用，直到参数个数满足原函数的形参个数为止  

---

## 💡 解题思路

1. 获取原函数的形参个数 `fn.length`
2. 在闭包中累积参数，每次调用返回一个新的函数，直到累计参数长度 ≥ 形参个数
3. 当参数足够时执行 `fn.apply(this, args)` 并返回结果

---

## ✅ 面试回答（标准版）

1. **基本实现思路**  
   - 柯里化就是把「一次性接受多个参数的函数」改造为「支持分多次接受部分参数」的函数。  
   - 关键点：  
     - 在闭包中维护一个参数数组 `args`。  
     - 每次调用时将新参数追加到 `args`。  
     - 当 `args.length >= fn.length` 时，执行原函数并返回结果；否则继续返回一个可接收更多参数的函数。  

2. **示例实现**  

```js
function curry(fn) {
  const expectedLen = fn.length;

  function curried(...args) {
    if (args.length >= expectedLen) {
      return fn.apply(this, args.slice(0, expectedLen));
    }
    return function (...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  }

  return curried;
}

// 示例使用：
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);

curriedAdd(1)(2)(3);    // 6
curriedAdd(1, 2)(3);    // 6
curriedAdd(1)(2, 3);    // 6
curriedAdd(1, 2, 3);    // 6
```

3. **扩展与注意点**  
   - 上述实现基于 `fn.length` 来确定需要的参数个数，适用于大多数普通函数。  
   - 若需要更灵活的行为（例如支持「不固定参数个数，直到显式调用结束函数」），可以通过约定特殊调用方式（如空调用 `fn()` 或使用占位符）来结束参数收集，属于进阶题目。  

