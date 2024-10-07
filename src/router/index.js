import { createRouter, createWebHistory } from 'vue-router';
import HoarderAuth from '../views/HoarderAuth.vue';
import HoarderNotes from '../views/HoarderNotes.vue';

const routes = [
  {
    path: '/',
    redirect: '/auth'
  },
  {
    path: '/auth',
    name: 'HoarderAuth',
    component: HoarderAuth
  },
  {
    path: '/notes',
    name: 'HoarderNotes',
    component: HoarderNotes,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken');

  // If navigating to '/' or '/auth' and token exists, redirect to '/notes'
  if ((to.path === '/' || to.path === '/auth') && token) {
    next('/notes');
    return;
  }

  // If the route requires auth and no token, redirect to '/auth'
  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    next('/auth');
  } else {
    next();
  }
});

export default router;