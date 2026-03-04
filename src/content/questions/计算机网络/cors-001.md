---
id: cors-001
title: CORS 预检请求（OPTIONS）的触发条件与作用
difficulty: medium
tags: [cors, http, options]
category: network
---

## 🧩 题目

在跨域 CORS 中，浏览器发送的 `OPTIONS` 请求是什么？预检请求的触发条件有哪些？它的作用是什么？

---

## 💡 解题思路

1. 简述同源策略与 CORS 基本概念
2. 解释简单请求 vs 非简单请求，预检出现在非简单请求前
3. 列出触发预检的条件：方法不是 GET/POST/HEAD、非简单头、非简单 Content-Type 等
4. 说明服务器在预检响应中告知允许的方法、头、来源以及缓存时间

---

## ✅ 面试回答（标准版）

1. **CORS 与预检请求的背景**  
   - 浏览器出于安全考虑实施同源策略，限制前端 JS 直接访问不同源（协议/域名/端口不同）的资源。  
   - CORS（Cross-Origin Resource Sharing）是一种标准机制，允许服务器通过设置特定响应头（如 `Access-Control-Allow-Origin`）来显式声明「哪些跨域请求是被允许的」。  
   - 对于某些「可能带来安全风险」的跨域请求，浏览器在真正发起请求前，会先发一个 `OPTIONS` 预检请求。  

2. **什么是预检请求（OPTIONS）？**  
   - 预检请求是一种由浏览器自动发起的 `OPTIONS` 请求，用来**「询问服务器是否允许后续的实际跨域请求」**。  
   - 这一步不会包含真正的业务数据，只是携带 CORS 相关头部（如 `Access-Control-Request-Method`、`Access-Control-Request-Headers`），让服务器在响应中声明：  
     - 允许的源（`Access-Control-Allow-Origin`）  
     - 允许的方法（`Access-Control-Allow-Methods`）  
     - 允许的自定义请求头（`Access-Control-Allow-Headers`）  
     - 预检结果可以缓存多久（`Access-Control-Max-Age`）  

3. **预检请求的触发条件（什么是「非简单请求」）**  
   浏览器将跨域请求分为**简单请求**和**非简单请求**：  
   - **简单请求**（不会触发预检）的条件大致包括：  
     - 方法：`GET`、`HEAD`、`POST`  
     - 请求头仅限于少数「简单头」：`Accept`、`Accept-Language`、`Content-Language`、`Content-Type`（且值限定为 `application/x-www-form-urlencoded`、`multipart/form-data`、`text/plain`）等  
   - 满足上述条件的跨域请求，浏览器会**直接发起实际请求**，再根据响应头判断是否允许访问响应内容。  
   - 若不满足上述任一条件（即「非简单请求」），就会在实际请求之前自动发送一个 `OPTIONS` 预检请求。典型触发场景：  
     - 使用了 `PUT`、`DELETE`、`PATCH` 等方法  
     - 自定义请求头（如 `Authorization`、`X-Custom-Header`）  
     - `Content-Type` 为 `application/json` 等非简单类型  

4. **预检请求的作用与流程**  
   - **作用**：在发送真正的跨域请求前，先与服务器「协商权限」，只有当服务器明确允许时才继续发送带有业务数据的请求，从而降低 CSRF 类风险。  
   - 简化流程：  
     1）浏览器发现这是一个非简单跨域请求 → 自动发送 `OPTIONS` 预检到目标服务器。  
     2）服务器在预检响应中返回 CORS 相关头部，表明是否允许该跨域操作。  
     3）如果允许，浏览器再发送实际请求（如 `POST /api`）。  
     4）若设置了 `Access-Control-Max-Age`，在有效期内浏览器可复用预检结果，不再重复发 OPTIONS。  

5. **服务端处理要点**  
   - 需要对 `OPTIONS` 请求做快速响应，返回正确的 CORS 头部并可避免耗时逻辑。  
   - 正确配置允许的方法、头部、来源和凭证（`Access-Control-Allow-Credentials`），并结合后端鉴权与 CSRF 防护。  

一句话：在 CORS 中，`OPTIONS` 预检请求是浏览器为「非简单跨域请求」提前做的一次安全协商，确认服务器是否允许该跨域操作，只有预检通过后才会真正发送携带业务数据的请求。  

