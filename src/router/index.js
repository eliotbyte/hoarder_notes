import { createRouter, createWebHistory } from 'vue-router'
import HoarderAuth from '../views/HoarderAuth.vue'
import HoarderNotes from '../views/HoarderNotes.vue'

const routes = [
  {
    path: '/',
    redirect: '/auth',
  },
  {
    path: '/auth',
    name: 'HoarderAuth',
    component: HoarderAuth,
  },
  {
    path: '/notes',
    name: 'HoarderNotes',
    component: HoarderNotes,
    meta: { requiresAuth: true },
  },
  {
    path: '/notes/:id',
    name: 'HoarderNoteDetail',
    component: HoarderNotes, // Use the same component
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      // Use the saved scroll position if available
      return savedPosition
    } else {
      // Scroll to top when navigating to a new route
      return { top: 0 }
    }
  },
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')

  if ((to.path === '/' || to.path === '/auth') && token) {
    next('/notes')
    return
  }

  if (to.matched.some((record) => record.meta.requiresAuth) && !token) {
    next('/auth')
  } else {
    next()
  }
})

export default router
