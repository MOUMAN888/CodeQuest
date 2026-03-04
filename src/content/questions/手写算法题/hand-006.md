---
id: hand-006
title: 版本号排序、最大正方形面积与链表环检测
difficulty: medium
tags: [algorithm, sort, dp, linked-list]
category: algorithm
---

## 🧩 题目

请分别实现以下三个算法题：

1. 给定版本号列表（如 `["1.0.1", "2.0", "1.0.0"]`），实现按版本号规则排序（从小到大）。  
2. 给定一个由 `'0'` 和 `'1'` 组成的二维矩阵，找到其中只包含 `'1'` 的最大正方形，并返回其面积。  
3. 判断单向链表是否有环（环形链表检测）。  

---

## 💡 解题思路

1. 版本号排序：按 `.` 分割成数字数组，逐段比较，缺失段视为 0
2. 最大正方形：动态规划，`dp[i][j]` 表示以 `(i,j)` 为右下角的最大边长
3. 链表环检测：快慢指针（Floyd 判圈算法）

---

## ✅ 面试回答（标准版）

1. **版本号排序**  

```js
function compareVersion(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  const len = Math.max(pa.length, pb.length);

  for (let i = 0; i < len; i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

function sortVersions(arr) {
  return arr.slice().sort(compareVersion);
}
```

2. **最大正方形面积（动态规划）**  
   - 状态定义：`dp[i][j]` 表示以 `matrix[i][j]` 为右下角的最大正方形边长。  
   - 转移方程：  
     - 若 `matrix[i][j] == '1'`：  
       \[
       dp[i][j] = \min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1
       \]  
     - 否则 `dp[i][j] = 0`。  

```js
function maximalSquare(matrix) {
  if (!matrix.length || !matrix[0].length) return 0;
  const m = matrix.length;
  const n = matrix[0].length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  let maxSide = 0;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (matrix[i - 1][j - 1] === '1') {
        dp[i][j] =
          Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
        maxSide = Math.max(maxSide, dp[i][j]);
      }
    }
  }
  return maxSide * maxSide;
}
```

3. **判断链表是否有环（快慢指针）**  
   - 使用两个指针：慢指针每次走一步，快指针每次走两步。  
   - 如果链表有环，快指针最终会在环内追上慢指针；若快指针到达 `null` 则无环。  

```js
function hasCycle(head) {
  if (!head || !head.next) return false;
  let slow = head;
  let fast = head.next;

  while (fast && fast.next) {
    if (slow === fast) return true;
    slow = slow.next;
    fast = fast.next.next;
  }
  return false;
}
```

