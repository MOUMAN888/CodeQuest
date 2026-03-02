---
id: html-002
title: 块级元素与行内元素的区别
difficulty: easy
tags: [html, layout]
category: html
---

## 🧩 题目

请说明块级元素（block）与行内元素（inline）的区别，并分别举出 3 个常见标签。

---

## 💡 解题思路

1. 显示特性：是否独占一行、是否可以设置宽高
2. 典型块级元素：`div`、`p`、`h1~h6`、`ul/li` 等
3. 典型行内元素：`span`、`a`、`strong`、`em` 等
4. 注意 HTML5 中有「行内块级元素」（inline-block）的概念

---

## ✅ 面试回答（标准版）

在 HTML 中，块级元素会**独占一整行**，默认宽度会铺满父容器，可以直接设置 `width/height/margin/padding`，常见的有 `div`、`p`、`h1~h6`、`ul/li` 等。行内元素则**不会独占一行**，多个行内元素会在同一行内依次排列，通常 **不能直接设置宽高**，上下方向的 `margin` 支持也有限，典型如 `span`、`a`、`strong`、`em` 等。  
从布局角度看，块级元素更适合作为结构容器，而行内元素更适合对文字或小片内容做语义标记；另外 CSS 中还有 `display: inline-block` 这种「行内块」形式，既能在一行内排布，又允许设置宽高。

