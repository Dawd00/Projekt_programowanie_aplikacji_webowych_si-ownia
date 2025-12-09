import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/Users.vue'),
    },
    {
      path: '/passes',
      name: 'passes',
      component: () => import('../views/Passes.vue'),
    },
    {
      path: '/bookings',
      name: 'bookings',
      component: () => import('../views/Bookings.vue'),
    },
  ],
})

export default router

