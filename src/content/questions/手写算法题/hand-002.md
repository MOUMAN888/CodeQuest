---
id: hand-002
title: 手写实现 Promise.all 与 Promise.race
difficulty: medium
tags: [javascript, promise, async]
category: algorithm
---

## 🧩 题目

手写实现 `Promise.all` 和 `Promise.race`，要求：

1. 支持传入可迭代对象（通常是数组），元素可以是 Promise 或普通值  
2. 正确处理异步执行顺序与结果顺序  
3. 正确处理错误边界：  
   - `Promise.all`：任何一个 Promise 失败时整体失败  
   - `Promise.race`：谁先解决（成功/失败）就以谁为准  

---

## 💡 解题思路

1. 参数先通过 `Array.from` 统一处理
2. 对每一项用 `Promise.resolve` 包装，使之统一为 Promise
3. all：用计数器 + 结果数组，按索引保存结果，全部成功后 resolve；任意 reject 立即 reject
4. race：对每个 Promise 注册 `then`/`catch`，谁先 settle 就 resolve/reject 外部 Promise

---

## ✅ 面试回答（标准版）

1. **手写 `Promise.all`**  

```js
function myPromiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const promises = Array.from(iterable);
    const len = promises.length;
    if (len === 0) return resolve([]);

    const results = new Array(len);
    let count = 0;

    promises.forEach((p, index) => {
      Promise.resolve(p).then(
        value => {
          results[index] = value;  // 保证顺序
          count += 1;
          if (count === len) {
            resolve(results);
          }
        },
        err => {
          reject(err); // 任意一个失败，整体失败
        }
      );
    });
  });
}
```

2. **手写 `Promise.race`**  

```js
function myPromiseRace(iterable) {
  return new Promise((resolve, reject) => {
    for (const p of iterable) {
      Promise.resolve(p).then(resolve, reject);
    }
  });
}
```

3. **注意点与边界情况**  
   - 必须对传入值做 `Promise.resolve` 包装，支持普通值和「类 Promise 对象」（thenable）。  
   - 对空数组：  
     - `Promise.all([])` 应该立即 resolve 一个空数组。  
     - `Promise.race([])` 会返回一个永远 pending 的 Promise（不触发任何 then/catch）。  
   - 在真实实现中，还需要考虑迭代器抛错、`this` 绑定等更严格的规范细节，这里作为面试手写实现可以不用覆盖全部边界。  

