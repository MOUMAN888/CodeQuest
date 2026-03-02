import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'CodeQuest', layout: 'full' },
  },
  {
    path: '/quiz/:category',
    name: 'quiz',
    component: () => import('../views/QuizView.vue'),
    meta: { title: '刷题', layout: 'quiz' },
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: { name: 'home' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, _from, next) => {
  const title = to.meta.title as string | undefined
  if (title) {
    document.title = `${title} | CodeQuest`
  }
  next()
})

export default router
