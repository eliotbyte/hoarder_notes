import { createRouter, createWebHistory } from 'vue-router';
import HoarderAuth from '../views/HoarderAuth.vue';
import HoarderDashboard from '../views/HoarderDashboard.vue';

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
    path: '/dashboard',
    name: 'HoarderDashboard',
    component: HoarderDashboard,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken');
  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    next('/auth');
  } else {
    next();
  }
});

export default router;
