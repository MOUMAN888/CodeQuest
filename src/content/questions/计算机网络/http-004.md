---
id: http-004
title: HTTP 报文结构：请求报文与响应报文
difficulty: medium
tags: [http, message, request, response]
category: network
---

## 🧩 题目

HTTP 报文由哪些部分组成？请求报文和响应报文的具体结构有什么差异？请简要描述各部分的作用。

---

## 💡 解题思路

1. 报文整体结构：起始行 + 首部（Header）+ 空行 + 可选的消息体（Body）
2. 请求行 vs 状态行：方法/URL/版本 vs 版本/状态码/原因短语
3. 常见请求头、响应头、实体头示例
4. 简述 Body 的类型：JSON、表单、多部分、二进制等

---

## ✅ 面试回答（标准版）

1. **HTTP 报文的整体结构**  
   无论是请求报文还是响应报文，基本结构都是：  

   \[起始行\] + \[首部字段（Header）\] + 空行 + \[可选消息体（Body）\]  

   - 起始行：请求报文叫「请求行」，响应报文叫「状态行」  
   - 首部字段：一行一个 `Key: Value`，描述元信息  
   - 空行：分隔头部与消息体  
   - 消息体：实际要传输的数据，可为空  

2. **请求报文结构**  
   - **请求行（Request Line）**：  

   ```text
   METHOD SP REQUEST-TARGET SP HTTP-VERSION CRLF
   例如：GET /api/users?page=1 HTTP/1.1
   ```

   - **请求头（Request Headers）**：  
     - `Host`：目标主机名和端口  
     - `User-Agent`：客户端信息  
     - `Accept` / `Accept-Language` / `Accept-Encoding`：可接受的响应格式  
     - `Cookie`：携带会话信息  
     - `Content-Type`、`Content-Length`：带请求体时描述内容类型和长度  
     - 还有很多业务相关或自定义头（`Authorization`、`X-Request-Id` 等）  
   - **空行**  
   - **消息体（Body，可选）**：  
     - GET 请求通常不带 Body  
     - POST/PUT/PATCH 请求常在 Body 中携带表单、JSON、文件等数据  

3. **响应报文结构**  
   - **状态行（Status Line）**：  

   ```text
   HTTP-VERSION SP STATUS-CODE SP REASON-PHRASE CRLF
   例如：HTTP/1.1 200 OK
   ```

   - **响应头（Response Headers）**：  
     - `Content-Type`：响应体类型（如 `application/json`、`text/html`）  
     - `Content-Length` / `Transfer-Encoding`：内容长度或传输编码方式  
     - `Cache-Control`、`ETag`、`Last-Modified`：缓存相关  
     - `Set-Cookie`：服务端设置 Cookie  
     - 以及跨域相关的 `Access-Control-*` 等  
   - **空行**  
   - **消息体（Body，可选）**：  
     - 成功请求通常在 Body 中返回 HTML、JSON、图片等数据  
     - 某些状态码（如 204、304）通常没有消息体  

4. **请求报文与响应报文的差异小结**  
   - 起始行不同：请求行标明「我想对哪个资源执行什么操作」，状态行标明「服务器对这个请求的处理结果」  
   - 首部字段有各自的常用集合，但也有部分通用字段（如缓存、内容类型）  
   - 消息体的内容方向相反：请求体由客户端发送给服务端，响应体由服务端返回给客户端  

理解 HTTP 报文结构，有助于在调试接口、分析抓包、排查线上问题时快速定位是「请求有问题」还是「响应有问题」，以及对应的头部配置是否正确。  

