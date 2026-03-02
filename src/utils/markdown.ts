import { marked } from 'marked'

marked.setOptions({
  gfm: true,
  breaks: true,
})

/**
 * 将 Markdown 字符串转为 HTML，用于展示（题目内容、AI 回复等）。
 * 若内容来自用户输入或不可信源，建议先对输出做 sanitize（如 DOMPurify）。
 */
export function markdownToHtml(md: string): string {
  if (!md || typeof md !== 'string') return ''
  return marked.parse(md, { async: false }) as string
}
