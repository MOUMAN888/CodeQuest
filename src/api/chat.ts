import axios from 'axios'

const DEFAULT_DEV_API = 'http://localhost:8000'

/**
 * 运行时自动选择后端地址：
 * - 优先使用环境变量 VITE_API_BASE_URL（若已配置）
 * - 本地开发（localhost）且未配置时 → 使用 http://localhost:8000
 * - 生产/非 localhost 且未配置时 → 使用当前站点 origin（同域部署时 Nginx 可代理 /chat）
 */
function getBaseURL() {
  const envUrl =
    typeof import.meta !== 'undefined'
      ? (import.meta.env.VITE_API_BASE_URL as string | undefined)
      : undefined

  if (envUrl && String(envUrl).trim()) return envUrl.trim()

  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin
    const isLocalhost =
      /^https?:\/\/localhost(:\d+)?$/i.test(origin) ||
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/i.test(origin)
    if (isLocalhost) return DEFAULT_DEV_API
    return origin
  }

  return DEFAULT_DEV_API
}

const chatClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 120_000,
  headers: { 'Content-Type': 'application/json' },
})

export type ChatResponse = {
  reply: string
  success: boolean
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const { data } = await chatClient.post<ChatResponse>('/chat', { message })
  return data
}

