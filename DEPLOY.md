# 部署说明

## 1. 构建

```bash
npm install
npm run build
```

产物在 `dist/` 目录。

## 2. 环境变量（可选）

- **前后端同域**：无需配置，会自动使用当前站点地址请求 `/chat`。
- **前后端分域**：复制 `.env.production.example` 为 `.env.production`，填写后端地址：

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

然后重新执行 `npm run build`。

## 3. 部署到子路径（如 /app/）

在 `vite.config.ts` 中设置：

```ts
export default defineConfig({
  base: '/app/',
  // ...
})
```

并确保服务器（如 Nginx）的 `root` 指向包含 `index.html` 的目录。

## 4. 服务器配置

- 使用 `deploy/nginx.conf.example` 作为参考，配置 SPA 的 `try_files` 回退。
- 若前后端同域，可在 Nginx 中用 `location /chat` 反向代理到后端。

## 5. 后端要求

- 提供 `POST /chat`，请求体 `{ message: string }`，响应 `{ reply: string, success: boolean }`。
- 若前后端分域，后端需配置 CORS 允许前端域名。
