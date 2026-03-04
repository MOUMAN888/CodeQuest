import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { visualizer } from "rollup-plugin-visualizer"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    visualizer({
      open: true, // 构建完成后自动在浏览器打开统计图
      filename: "dist/stats.html", // 生成的报告文件路径
      gzipSize: true, // 显示 gzip 压缩后的大小（更真实）
      brotliSize: true, // 显示 brotli 压缩后的大小
      template: "treemap", // 图表类型：treemap (树状图), sunburst (旭日图), network (网络图)
      // 只有当 npm 命令包含 'build' 时才启用，避免影响 dev
      // 其实直接放在这里也没事，因为它只在 build 阶段生效
    }),
  ],
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
