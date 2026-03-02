---
id: html-001
title: 什么是 DOCTYPE？
difficulty: easy
tags: [html, standard]
category: html
---

## 🧩 题目

HTML 文档中的 `<!DOCTYPE html>` 有什么作用？如果不写会有什么影响？

---

## 💡 解题思路

1. 声明当前文档使用的 HTML 规范（HTML5）
2. 告诉浏览器以「标准模式」而不是「怪异模式」渲染
3. 不写会触发兼容模式，导致盒模型、布局等行为不一致

---

## ✅ 面试回答（标准版）

`<!DOCTYPE html>` 是 HTML5 的文档类型声明，用来告诉浏览器这份页面使用 HTML5 标准来解析和渲染，从而进入标准模式。如果不写或写错，浏览器可能会进入怪异模式（Quirks Mode），部分老规则会被启用，比如盒模型宽度计算不同，最终导致不同浏览器之间的布局偏差甚至样式错乱。

