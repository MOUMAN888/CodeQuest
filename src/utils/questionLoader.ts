export type Question = {
  id: string
  title: string
  difficulty: string
  tags: string[]
  category: string
  question: string
  thinking: string
  answer: string
}

type FrontMatter = {
  id?: string
  title?: string
  difficulty?: string
  tags?: string[]
  category?: string
}

const modules = import.meta.glob('../content/questions/**/*.md', {
  as: 'raw',
  eager: true,
}) as Record<string, string>

function parseFrontMatter(block: string): FrontMatter {
  const lines = block
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const fm: FrontMatter = {}

  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const rawValue = line.slice(idx + 1).trim()

    if (key === 'tags') {
      const match = rawValue.match(/\[(.*)\]/)
      if (match && match[1]) {
        fm.tags = match[1]
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      }
    } else {
      const cleaned = rawValue.replace(/^['"]|['"]$/g, '')
      ;(fm as any)[key] = cleaned
    }
  }

  return fm
}

function extractSection(content: string, heading: string): string {
  const idx = content.indexOf(heading)
  if (idx === -1) return ''
  const start = idx + heading.length
  const rest = content.slice(start)
  const nextIdx = rest.search(/\n## /)
  if (nextIdx === -1) return rest.trim()
  return rest.slice(0, nextIdx).trim()
}

function parseQuestion(path: string, raw: string): Question | null {
  const trimmed = raw.trim()
  const fmStart = trimmed.indexOf('---')
  if (fmStart !== 0) return null
  const fmEnd = trimmed.indexOf('---', 3)
  if (fmEnd === -1) return null

  const fmBlock = trimmed.slice(3, fmEnd).trim()
  const fm = parseFrontMatter(fmBlock)

  const body = trimmed.slice(fmEnd + 3).trim()
  const question = extractSection(body, '## 🧩 题目')
  const thinking = extractSection(body, '## 💡 解题思路')
  const answer = extractSection(body, '## ✅ 面试回答（标准版）')

  const category =
    fm.category ||
    path
      .split('/')
      .find((seg) => ['html', 'css', 'js', 'vue', 'react'].includes(seg)) ||
    'misc'

  return {
    id: fm.id || path,
    title: fm.title || '未命名题目',
    difficulty: fm.difficulty || 'medium',
    tags: fm.tags || [],
    category: category.toLowerCase(),
    question,
    thinking,
    answer,
  }
}

const allQuestions: Question[] = Object.entries(modules)
  .map(([path, raw]) => parseQuestion(path, raw))
  .filter((q): q is Question => q !== null)

const questionsByCategory: Record<string, Question[]> = {}

for (const q of allQuestions) {
  const key = q.category.toLowerCase()
  if (!questionsByCategory[key]) questionsByCategory[key] = []
  questionsByCategory[key].push(q)
}

const categoryKeys = Object.keys(questionsByCategory).sort()

export function getQuestionsByCategory(category: string): Question[] {
  const key = category.toLowerCase()
  return questionsByCategory[key] || []
}

export type CategoryMeta = {
  key: string
  label: string
  description: string
  iconClass: string
}

const CATEGORY_CONFIG: Partial<Record<string, Omit<CategoryMeta, 'key'>>> = {
  html: {
    label: 'HTML 基础',
    description: '语义化、SEO、可访问性',
    iconClass: 'fab fa-html5 card-icon card-icon--html',
  },
  css: {
    label: 'CSS & 布局',
    description: '盒模型、Flex、Grid',
    iconClass: 'fab fa-css3-alt card-icon card-icon--css',
  },
  js: {
    label: 'JavaScript 核心',
    description: 'Event Loop、闭包、原型链',
    iconClass: 'fab fa-js-square card-icon card-icon--js',
  },
  vue: {
    label: 'Vue 技巧',
    description: '响应式、组件、路由',
    iconClass: 'fab fa-vuejs card-icon card-icon--vue',
  },
  react: {
    label: 'React 思维',
    description: 'VDOM、Hooks、状态管理',
    iconClass: 'fab fa-react card-icon card-icon--react',
  },
}

export function getAllCategories(): CategoryMeta[] {
  return categoryKeys.map((key) => {
    const conf = CATEGORY_CONFIG[key]
    if (conf) return { key, ...conf }
    return {
      key,
      label: key.toUpperCase(),
      description: '自定义题库分类',
      iconClass: 'fas fa-code card-icon',
    }
  })
}

