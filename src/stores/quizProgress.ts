import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'codequest-quiz-progress'

function loadProgress(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const out: Record<string, number> = {}
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof k === 'string' && typeof v === 'number' && Number.isInteger(v) && v >= 0) {
          out[k] = v
        }
      }
      return out
    }
  } catch {
    // ignore
  }
  return {}
}

function saveProgress(progress: Record<string, number>) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // ignore
  }
}

export const useQuizProgressStore = defineStore('quizProgress', () => {
  const progressByCategory = ref<Record<string, number>>(loadProgress())

  watch(
    progressByCategory,
    (val) => saveProgress(val),
    { deep: true }
  )

  /** 获取某分类上次刷到的题目下标，若无则返回 0 */
  function getIndex(category: string): number {
    const idx = progressByCategory.value[category]
    return typeof idx === 'number' && Number.isInteger(idx) && idx >= 0 ? idx : 0
  }

  /** 保存某分类当前题目下标 */
  function setIndex(category: string, index: number) {
    if (!Number.isInteger(index) || index < 0) return
    progressByCategory.value = { ...progressByCategory.value, [category]: index }
  }

  return { getIndex, setIndex }
})
