---
id: hand-009
title: 实现 URL 查询参数解析函数
difficulty: easy
tags: [javascript, url, parsing]
category: algorithm
---

## 🧩 题目

实现一个 URL 参数解析函数，将 URL 中的查询参数解析为对象，要求：

1. 支持简单键值对（如 `?a=1&b=2` → `{ a: '1', b: '2' }`）  
2. 支持同名多值（如 `?tag=a&tag=b` → `{ tag: ['a', 'b'] }`）  
3. 支持 URL 编码/解码（如空格、特殊字符等）  

---

## 💡 解题思路

1. 从 URL 中截取 `?` 之后到 `#` 之前的部分
2. 按 `&` 拆分为若干 `key=value`，再按 `=` 拆分键和值
3. 使用 `decodeURIComponent` 处理编码
4. 对同名 key：第一次为字符串，后续若再次出现则转为数组累积

---

## ✅ 面试回答（标准版）

```js
function parseQuery(url) {
  const res = {};
  if (!url) return res;

  const queryIndex = url.indexOf('?');
  if (queryIndex === -1) return res;

  // 截取 ? 之后、# 之前的部分
  let query = url.slice(queryIndex + 1);
  const hashIndex = query.indexOf('#');
  if (hashIndex !== -1) {
    query = query.slice(0, hashIndex);
  }

  if (!query) return res;

  const pairs = query.split('&');

  for (const pair of pairs) {
    if (!pair) continue;
    const [rawKey, rawValue = ''] = pair.split('=');
    if (!rawKey) continue;

    const key = decodeURIComponent(rawKey);
    const value = decodeURIComponent(rawValue.replace(/\+/g, ' '));

    if (res.hasOwnProperty(key)) {
      const cur = res[key];
      if (Array.isArray(cur)) {
        cur.push(value);
      } else {
        res[key] = [cur, value];
      }
    } else {
      res[key] = value;
    }
  }

  return res;
}

// 示例：
// parseQuery('https://a.com?p=1&tag=a&tag=b')
// => { p: '1', tag: ['a', 'b'] }
```

在现代浏览器中，也可以使用内置的 `URL` 和 `URLSearchParams` 来解析查询参数，但手写实现有助于理解底层行为和兼容性处理。  

