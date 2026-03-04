---
id: other-001
title: 常见 Web 安全威胁与防御措施
difficulty: medium
tags: [security, xss, csrf, clickjacking]
category: other
---

## 🧩 题目

Web 安全中有哪些常见的攻击方式（例如 XSS、CSRF、点击劫持等）？分别会造成什么危害？前端和后端可以采取哪些防御措施？

---

## 💡 解题思路

1. 列出典型攻击：XSS、CSRF、点击劫持、SQL 注入（简单提）、敏感信息泄露
2. 对每种攻击说明原理和危害
3. 给出前后端结合的防御策略：编码/校验、Cookie 设置、Token、防 iframe、CSP 等

---

## ✅ 面试回答（标准版）

1. **XSS（跨站脚本攻击）**  
   - 原理：攻击者将恶意脚本注入到页面中，在受害者浏览器中执行，窃取 Cookie、伪造操作、篡改界面等。  
   - 危害：账号被盗、数据泄露、钓鱼页面等。  
   - 防御：  
     - **输出编码**：对所有输出到 HTML / 属性 / JS / URL 的动态内容进行适当的转义和编码。  
     - **严禁信任用户输入的 HTML**：尽量避免 `innerHTML`、`v-html`、`dangerouslySetInnerHTML` 等；若必须使用，先通过白名单过滤（如 DOMPurify）。  
     - **设置 HttpOnly Cookie**：防止通过 JS 直接读取敏感 Cookie。  
     - **使用 CSP（Content Security Policy）**：限制可执行脚本来源，禁止内联脚本，减小 XSS 成功概率和影响。  

2. **CSRF（跨站请求伪造）**  
   - 原理：利用浏览器会自动携带 Cookie 的特性，在用户不知情的情况下引导浏览器向可信站点发起伪造请求（如转账、修改密码）。  
   - 防御：  
     - **CSRF Token**：服务端在页面中下发随机 Token，表单提交或 Ajax 请求时必须携带，服务器对 Token 进行校验。  
     - **SameSite Cookie**：设置 Cookie 的 `SameSite` 属性为 `Lax`/`Strict`，限制第三方站点自动携带 Cookie。  
     - **验证码 / 二次确认**：对高风险操作增加人机验证或二次确认。  

3. **点击劫持（Clickjacking）**  
   - 原理：攻击者在自己的页面中通过 iframe 嵌入受害网站，并通过 CSS 让其不可见或部分可见，引诱用户点击，从而执行敏感操作。  
   - 防御：  
     - 在响应头中设置：`X-Frame-Options: DENY` 或 `SAMEORIGIN`，禁止页面被其他站点的 iframe 嵌入。  
     - 使用 CSP：`Content-Security-Policy: frame-ancestors 'self';`。  

4. **其他常见风险与防护要点**  
   - **敏感信息泄露**：避免在前端代码或接口返回中暴露密钥、Token、内部接口地址等。  
   - **HTTP 明文传输**：使用 HTTPS，防止中间人攻击窃听或篡改。  
   - **弱鉴权与越权访问**：后端必须做权限校验，前端控制仅为体验，不可依赖前端隐藏按钮作为安全边界。  

总结：Web 安全需要前后端共同参与，前端侧重于「输入/输出安全」与「界面防护」，后端负责严格的身份认证与权限校验，同时配合 Cookie 策略、CSRF Token、CSP 等多重防线。  

