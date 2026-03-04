---
id: http-003
title: 浏览器缓存机制：强缓存与协商缓存
difficulty: medium
tags: [http, cache, browser]
category: network
---

## 🧩 题目

浏览器有哪些常见的缓存方式？其中「强缓存」和「协商缓存」有什么区别？它们各自的实现原理和优先级是怎样的？

---

## 💡 解题思路

1. 先整体列出浏览器缓存层级：Service Worker、内存缓存、磁盘缓存、HTTP 缓存、本地存储等（点到即可）
2. 重点讲 HTTP 缓存中的强缓存（Expires / Cache-Control）与协商缓存（Last-Modified / ETag）
3. 说明浏览器请求流程：先看强缓存，命中则直接使用；否则带条件头走协商缓存
4. 强调 Cache-Control 优先于 Expires，ETag 优先于 Last-Modified

---

## ✅ 面试回答（标准版）

1. **浏览器缓存的大致层级**  
   - 按范围和能力大致可以分为：  
     - HTTP 缓存（强缓存、协商缓存）  
     - Service Worker 缓存（可编程控制，常用于 PWA）  
     - 内存缓存（Memory Cache，生命周期短，关闭标签页即失效）  
     - 磁盘缓存（Disk Cache，持久化存储）  
     - 以及本地存储类：`localStorage`、`sessionStorage`、IndexedDB 等（不属于 HTTP 缓存，但也能承载数据）  
   - 面试题通常重点在 **HTTP 缓存：强缓存 + 协商缓存**。  

2. **强缓存（Freshness, 不发请求）**  
   - 目标：在缓存未过期时，**浏览器直接使用本地缓存副本，而不向服务器发请求**。  
   - 相关响应头：  
     - `Expires`（HTTP/1.0）：绝对过期时间，受本地时间影响较大  
     - `Cache-Control`（HTTP/1.1）：优先级更高，常用指令：  
       - `max-age=xxx`：资源在 xxx 秒内有效  
       - `no-cache`：不使用强缓存，但允许协商缓存  
       - `no-store`：不使用任何缓存  
   - 浏览器流程：  
     - 如果命中强缓存（未过期且未被标记为 no-cache/no-store），浏览器直接返回 200（from disk/memory cache），**不会与服务器通信**。  

3. **协商缓存（Validation, 需发请求但可返回 304）**  
   - 目标：资源可能已过期，但浏览器可以**向服务器确认资源是否真的有更新**，如果没有更新则避免重新下载。  
   - 相关响应头 + 请求头：  
     - 基于时间：  
       - 响应头：`Last-Modified`（资源最后修改时间）  
       - 下一次请求头：`If-Modified-Since: <上次的 Last-Modified>`  
     - 基于内容指纹：  
       - 响应头：`ETag`（资源的唯一标识，通常是哈希）  
       - 下一次请求头：`If-None-Match: <上次的 ETag>`  
   - 浏览器流程：  
     - 当强缓存失效或被 `no-cache` 禁用时，浏览器会带上条件请求头询问服务器：  
       - 如果服务器判断资源**未修改** → 返回 `304 Not Modified`，响应体为空，浏览器继续使用本地缓存副本  
       - 如果资源已更新 → 返回 `200 OK` + 新内容 + 新的缓存标识（Last-Modified/ETag）  

4. **优先级关系与整体流程**  
   - 浏览器每次加载资源的大致顺序：  
     1）**先检查强缓存**（`Cache-Control` / `Expires`）：  
        - 若仍在有效期内且未被标记为 `no-cache/no-store` → 直接用本地缓存，不发请求  
     2）强缓存不命中或被禁止时，再发起请求走**协商缓存**：  
        - 携带 `If-None-Match` / `If-Modified-Since` → 服务器决定返回 304 还是 200  
     3）若协商缓存也不命中 → 下载新资源并更新本地缓存  
   - 同一类型内部的优先级：  
     - `Cache-Control` 的优先级高于 `Expires`  
     - `ETag` 的优先级高于 `Last-Modified`（更精确）  

5. **实践建议**  
   - 对静态资源（JS/CSS/图片等）常用模式：  
     - 文件名带 hash（内容变更即 hash 变）、`Cache-Control: max-age=31536000, immutable`，最大化利用强缓存  
   - 对动态接口：  
     - 更常用协商缓存（ETag）或自行在应用层做缓存与过期控制  
   - 合理的缓存策略可以显著提升首屏速度和整体性能，也是前端性能优化的重要一环。  

