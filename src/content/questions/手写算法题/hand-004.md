---
id: hand-004
title: 多层级数组扁平化的实现与复杂度分析
difficulty: medium
tags: [javascript, array, flatten]
category: algorithm
---

## 🧩 题目

实现一个多层级数组扁平化函数，将诸如 `[1, [2, [3]]]` 转换为 `[1, 2, 3]`。要求：

1. 使用递归实现  
2. 使用 `Array.prototype.reduce` 实现  
3. 分析两种实现的时间与空间复杂度  

---

## 💡 解题思路

1. 递归：遍历数组，若元素是数组则递归展开，否则加入结果
2. reduce：在回调中累加扁平化结果，与递归逻辑类似
3. 复杂度：都需要访问每个元素一次，时间复杂度 O(n)，递归深度与嵌套层级相关

---

## ✅ 面试回答（标准版）

1. **递归版本实现**  

```js
function flattenRecursive(arr) {
  const result = [];

  function helper(sub) {
    for (const item of sub) {
      if (Array.isArray(item)) {
        helper(item);
      } else {
        result.push(item);
      }
    }
  }

  helper(arr);
  return result;
}
```

2. **reduce 版本实现**  

```js
function flattenWithReduce(arr) {
  return arr.reduce((acc, item) => {
    if (Array.isArray(item)) {
      return acc.concat(flattenWithReduce(item));
    }
    acc.push(item);
    return acc;
  }, []);
}
```

3. **复杂度分析**  
   - 假设数组中共有 \(n\) 个非数组元素：  
   - **时间复杂度**：  
     - 无论递归还是 reduce 实现，都需要对每个元素访问一次并进行类型判断，整体时间复杂度为 \(O(n)\)。  
     - reduce 版本中频繁使用 `concat` 可能带来额外的拷贝开销，在实现细节上会比手动 push 稍慢一些（`concat` 内部会遍历新数组并复制元素）。  
   - **空间复杂度**：  
     - 结果数组需要存储所有元素，空间为 \(O(n)\)。  
     - 调用栈深度与嵌套层级 \(d\) 有关，最坏情况下递归调用栈为 \(O(d)\)。对于非常深的嵌套，需注意可能的栈溢出风险。  

在实际项目中，若浏览器环境支持，也可以使用原生的 `Array.prototype.flat(Infinity)` 来实现扁平化，但面试手写更侧重于考察你对递归逻辑与复杂度的理解。  

