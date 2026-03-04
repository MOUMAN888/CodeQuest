---
id: http-005
title: HTTP1.0 下的 Fetch 使用与 Fetch/XHR 区别
difficulty: medium
tags: [http, fetch, xhr]
category: network
---

## 🧩 题目

在 HTTP/1.0 协议下可以使用 Fetch API 吗？`fetch` 与 `XMLHttpRequest`（XHR） 有哪些核心区别？

---

## 💡 解题思路

1. 澄清：Fetch 是浏览器 API，底层可基于任何 HTTP 版本（1.0/1.1/2），与协议版本解耦
2. 对比 Fetch 与 XHR：语法风格、Promise 化、流式读取、默认不发送 Cookie 等
3. 提及对请求/响应体的封装（Request/Response 对象）以及不可中断性（AbortController）

---

## ✅ 面试回答（标准版）

1. **HTTP/1.0 下是否可以使用 Fetch？**  
   - **可以使用**。  
   - Fetch 是浏览器提供的高层网络请求 API，调用 `fetch(url, options)` 时，浏览器会根据当前环境与服务器协商实际使用的 HTTP 版本（1.0 / 1.1 / 2 / 3 等）。  
   - 换句话说：**Fetch 与底层 HTTP 版本解耦**，只要浏览器和服务器能通过某个 HTTP 版本通信，就可以使用 Fetch；HTTP/1.0 并不限制是否能用 Fetch。  

2. **Fetch 与 XHR 的核心区别**  
   - **编程模型不同**：  
     - XHR 使用回调/事件（`onreadystatechange`、`onload` 等），历史包袱重。  
     - Fetch 基于 **Promise**（以及 `async/await`），错误处理和链式调用更自然。  
   - **API 设计更现代、语义更清晰**：  
     - Fetch 引入了 `Request`、`Response`、`Headers` 等对象，统一请求/响应抽象：  

     ```js
     const res = await fetch('/api');
     const data = await res.json();
     ```

   - **默认行为差异**：  
     - Fetch 默认 **不会携带 Cookie**，除非显式设置 `credentials: 'include'` 或 `same-origin`；  
     - XHR 默认会携带同源 Cookie。  
   - **跨域与 CORS 处理**：  
     - 两者都受 CORS 限制，但 Fetch 对一些 CORS 错误会直接返回「TypeError」而不是暴露详细信息，更严格遵守安全模型。  
   - **流式与可读性**：  
     - Fetch 支持基于 `ReadableStream` 的流式读取（如 `response.body`），适合处理大文件或流式响应（如 SSE 或 AI 流输出）。  
     - XHR 虽然也能处理进度事件，但不支持同样的 Streams API。  
   - **中断请求的方式**：  
     - XHR 通过 `xhr.abort()` 中断。  
     - Fetch 通过 `AbortController` / `AbortSignal` 中断：  

     ```js
     const controller = new AbortController();
     fetch('/api', { signal: controller.signal });
     controller.abort();
     ```

3. **总结**  
   - Fetch 是新一代浏览器网络请求 API，与 HTTP 版本相对独立；在 HTTP/1.0 环境中依然可以使用。  
   - 相比 XHR，Fetch 拥有更现代的 Promise 化接口、更合理的默认行为以及对流式处理和中断的更好支持，一般推荐在新项目中优先使用 Fetch。  

