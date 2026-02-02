import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireGuest, requireRole } from './guards'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      beforeEnter: requireGuest,
    },
    {
      path: '/',
      name: 'home',
      component: Home,
      beforeEnter: requireAuth,
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/Users.vue'),
      beforeEnter: requireRole(['ADMIN', 'EMPLOYEE']),
    },
    {
      path: '/passes',
      name: 'passes',
      component: () => import('../views/Passes.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/bookings',
      name: 'bookings',
      component: () => import('../views/Bookings.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/sessions',
      name: 'sessions',
      component: () => import('../views/Sessions.vue'),
      beforeEnter: requireRole(['ADMIN', 'EMPLOYEE']),
    },
    {
      path: '/employees',
      name: 'employees',
      component: () => import('../views/Employees.vue'),
      beforeEnter: requireRole(['ADMIN', 'EMPLOYEE']),
    },
  ],
})

export default router

