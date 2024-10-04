import { createRouter, createWebHistory } from 'vue-router'

const Home = () =>
  import(/* webpackChunkName: "home" */ '../views/HoarderHome.vue')
const NotePage = () =>
  import(/* webpackChunkName: "note-page" */ '../views/HoarderNotePage.vue')
const Login = () =>
  import(/* webpackChunkName: "login" */ '../views/HoarderLogin.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/note/:id',
    name: 'NotePage',
    component: NotePage,
    props: true,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
