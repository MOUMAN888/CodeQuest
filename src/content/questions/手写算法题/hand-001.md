---
id: hand-001
title: 手写实现函数防抖与节流
difficulty: medium
tags: [javascript, debounce, throttle]
category: algorithm
---

## 🧩 题目

实现函数防抖（`debounce`）和节流（`throttle`），要求支持以下场景：

1. 无参数函数调用  
2. 带参数 / 带 `this` 的调用  
3. 防抖函数支持「先执行一次、再防抖」的选项（即 leading 模式）  

请分别给出实现，并说明它们的典型应用场景。

---

## 💡 解题思路

1. 防抖：在一段时间内多次触发，只在最后一次（或第一次）触发后执行
2. 节流：在一段时间窗口内只允许执行一次
3. 使用闭包保存计时器 / 时间戳，注意 `this` 和参数透传
4. 提供 `immediate`/`leading` 配置控制首次执行时机

---

## ✅ 面试回答（标准版）

1. **防抖（debounce）的实现与应用**  
   - 定义：将多次高频触发合并为「最后一次」或「第一次」执行，常用于输入搜索、窗口 resize 等场景。  
   - 核心思路：在闭包中保存一个 `timer`，每次触发时先清除上一次的定时器，再开启新的定时器，定时器回调中执行真正的函数。  
   - 支持「立即执行一次」的版本，可以通过 `immediate` / `leading` 标志控制在第一次触发时立刻执行一次，之后在冷却时间内忽略后续调用。  

   简化实现示例（支持带参数 + this + immediate）：  

   ```js
   function debounce(fn, delay = 300, immediate = false) {
     let timer = null;
     let invoked = false;

     return function debounced(...args) {
       const context = this;

       if (immediate && !invoked) {
         fn.apply(context, args);
         invoked = true;
       }

       clearTimeout(timer);
       timer = setTimeout(() => {
         if (!immediate) {
           fn.apply(context, args);
         }
         invoked = false; // 下一轮可以再次立即执行
       }, delay);
     };
   }
   ```

2. **节流（throttle）的实现与应用**  
   - 定义：在连续触发的情况下，**保证在给定时间间隔内只执行一次**，常用于滚动监听、窗口 resize、按钮防重复点击等。  
   - 实现方式一（时间戳版）：记录上次执行时间，每次触发对比当前时间与上次时间差是否超过间隔。  
   - 实现方式二（定时器版）：如果当前有定时器在排队，则忽略新的触发，直到定时器执行结束后才能再次设置。  

   示例（时间戳版，支持 `this` / 参数）：  

   ```js
   function throttle(fn, interval = 300) {
     let lastTime = 0;
     return function throttled(...args) {
       const now = Date.now();
       if (now - lastTime >= interval) {
         lastTime = now;
         return fn.apply(this, args);
       }
     };
   }
   ```

3. **适用场景对比**  
   - 防抖：用户停止操作后再执行一次（如搜索建议、实时校验）。  
   - 节流：在操作过程中周期性执行（如滚动监听中的定位更新、窗口 resize 下的布局重算等）。  

