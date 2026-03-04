import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

// 本地存储中使用的 key，确保全局一致
const STORAGE_KEY = 'codequest-favorites'

// 从 localStorage 读取收藏数据，并做健壮性校验与清洗
function loadFavorites(): Record<string, number[]> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    // 只接受“普通对象”结构，防止被意外覆盖为数组等无效结构
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const out: Record<string, number[]> = {}
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof k !== 'string' || !Array.isArray(v)) continue
        // 过滤掉非法值，仅保留非负整数索引，并做去重与排序
        const nums = v
          .map((n) => (typeof n === 'number' && Number.isInteger(n) && n >= 0 ? n : null))
          .filter((n): n is number => n !== null)
        if (nums.length) out[k] = Array.from(new Set(nums)).sort((a, b) => a - b)
      }
      return out
    }
  } catch {
    // 解析失败时返回空对象，不影响应用正常运行
  }
  return {}
}

// 将收藏数据写入 localStorage
function saveFavorites(fav: Record<string, number[]>) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fav))
  } catch {
    // 存储异常时静默失败，避免打断用户操作
  }
}

// 题目收藏相关的 Pinia Store，按分类记录被收藏的题目索引
export const useFavoritesStore = defineStore('favorites', () => {
  // key 为题目分类，value 为该分类下已收藏题目的索引数组
  const favoritesByCategory = ref<Record<string, number[]>>(loadFavorites())

  // 监听收藏数据变化，自动同步到本地存储
  watch(
    favoritesByCategory,
    (val) => saveFavorites(val),
    { deep: true }
  )

  // 判断某一题目是否已被收藏
  function isFavorite(category: string, index: number): boolean {
    if (!Number.isInteger(index) || index < 0) return false
    const list = favoritesByCategory.value[category] || []
    return list.includes(index)
  }

  // 切换某题目的收藏状态：已收藏则取消，未收藏则添加
  function toggleFavorite(category: string, index: number) {
    if (!Number.isInteger(index) || index < 0) return
    const list = favoritesByCategory.value[category] || []
    const exists = list.includes(index)
    let next: number[]
    if (exists) {
      next = list.filter((n) => n !== index)
    } else {
      // 新增收藏时保持索引升序，便于展示和调试
      next = [...list, index].sort((a, b) => a - b)
    }
    favoritesByCategory.value = { ...favoritesByCategory.value, [category]: next }
  }

  // 获取某个分类下所有已收藏题目的索引
  function getFavorites(category: string): number[] {
    return favoritesByCategory.value[category] || []
  }

  // 获取所有存在收藏的分类 key（仅返回有至少 1 条收藏的分类）
  function getAllFavoriteCategories(): string[] {
    return Object.entries(favoritesByCategory.value)
      .filter(([, list]) => Array.isArray(list) && list.length > 0)
      .map(([key]) => key)
  }

  return { isFavorite, toggleFavorite, getFavorites, getAllFavoriteCategories }
})

