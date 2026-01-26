import { useRouter } from 'vue-router'

export const requireAuth = (to, from, next) => {
  const token = localStorage.getItem('token')
  if (token) {
    next()
  } else {
    next('/login')
  }
}

export const requireGuest = (to, from, next) => {
  const token = localStorage.getItem('token')
  if (!token) {
    next()
  } else {
    next('/')
  }
}

