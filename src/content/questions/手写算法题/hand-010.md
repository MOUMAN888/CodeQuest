---
id: hand-010
title: 多种数组去重方法与复杂度分析
difficulty: easy
tags: [javascript, array, dedupe]
category: algorithm
---

## 🧩 题目

实现数组去重的多种方法，并分析每种方法的时间与空间复杂度。可以假设数组元素为基本类型（number/string 等）。

---

## 💡 解题思路

1. `Set` 去重：最简单直观
2. 排序 + 一次遍历：适合已排序场景
3. 使用对象/Map 记录已出现元素
4. 分析每种方法的时间/空间复杂度与适用场景

---

## ✅ 面试回答（标准版）

1. **方法一：使用 `Set` 去重**  

```js
function uniqueWithSet(arr) {
  return Array.from(new Set(arr));
}
```

   - 时间复杂度：  
     - 插入 Set 和遍历的总成本约为 \(O(n)\)。  
   - 空间复杂度：  
     - Set 需要额外存储所有唯一元素，空间为 \(O(n)\)。  

2. **方法二：排序 + 一次遍历**  

```js
function uniqueWithSort(arr) {
  if (arr.length <= 1) return arr.slice();
  const sorted = arr.slice().sort();
  const result = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1]) {
      result.push(sorted[i]);
    }
  }
  return result;
}
```

   - 时间复杂度：  
     - 排序成本约为 \(O(n \log n)\)，遍历为 \(O(n)\)，整体 \(O(n \log n)\)。  
   - 空间复杂度：  
     - 排序可能需要额外 \(O(\log n)\) 栈空间；结果数组为 \(O(k)\)（k 为唯一元素个数）。  
   - 注意：会改变元素原有顺序。  

3. **方法三：使用对象/Map 记录出现过的元素**  

```js
function uniqueWithMap(arr) {
  const seen = new Map();
  const result = [];

  for (const item of arr) {
    if (!seen.has(item)) {
      seen.set(item, true);
      result.push(item);
    }
  }
  return result;
}
```

   - 时间复杂度：  
     - 对每个元素进行一次 Map 查找与插入，平均时间约为 \(O(1)\)，总体 \(O(n)\)。  
   - 空间复杂度：  
     - Map 存储唯一元素，空间为 \(O(n)\)。  
   - 与 `Set` 的区别主要在于可扩展性（可以存储额外信息），但本质相似。  

4. **方法对比与应用建议**  
   - 对一般场景：  
     - 推荐使用 `Set` 或 `Map`，实现简单且时间复杂度为 \(O(n)\)。  
   - 若项目中已经有排序需求：  
     - 可以在排序后的数组上顺便做去重，避免多一次遍历。  
   - 若需要保持原始顺序：  
     - `Set`、`Map` 和「顺序遍历 + 标记」方法都可以保序；「排序 + 去重」会改变原顺序，不适用。  

