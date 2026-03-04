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
  query: '?raw',
  import: 'default',
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
  es6: {
    label: 'ES6 & 语法进阶',
    description: '箭头函数、Promise、模块化',
    iconClass: 'fab fa-node-js card-icon',
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
  network: {
    label: '计算机网络 & HTTP',
    description: 'HTTP、TCP、实时通信',
    iconClass: 'fab fa-chrome card-icon',
  },
  engineering: {
    label: '工程化与构建工具',
    description: 'Webpack、Vite、Git 工作流',
    iconClass: 'fab fa-git-alt card-icon',
  },
  performance: {
    label: '性能优化',
    description: 'Web Vitals、渲染与长任务优化',
    iconClass: 'fab fa-google card-icon',
  },
  scenario: {
    label: '场景题 & 业务设计',
    description: '系统设计、业务场景与实践',
    iconClass: 'fab fa-stack-overflow card-icon',
  },
  algorithm: {
    label: '手写题 & 算法题',
    description: '手写实现、数据结构与算法',
    iconClass: 'fab fa-python card-icon',
  },
  other: {
    label: '其他高频问题',
    description: 'TS、调试、框架对比与安全',
    iconClass: 'fab fa-galactic-republic card-icon',
  },
}
const configOrder = Object.keys(CATEGORY_CONFIG)
const categoryKeys = [
  ...configOrder.filter((key) => questionsByCategory[key]),
  ...Object.keys(questionsByCategory).filter(
    (key) => !configOrder.includes(key)
  ),
]

const CATEGORY_ORDER = [
  'html',
  'css',
  'js',
  'es6',
  'vue',
  'react',
  'network',
  'engineering',
  'performance',
  'scenario',
  'algorithm',
  'other',
  'misc',
]

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

