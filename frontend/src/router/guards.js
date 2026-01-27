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

const getUserRole = () => {
  const userRaw = localStorage.getItem('user')
  if (!userRaw) return null
  try {
    const user = JSON.parse(userRaw)
    return user?.role || null
  } catch {
    return null
  }
}

export const requireRole = (roles) => (to, from, next) => {
  const token = localStorage.getItem('token')
  if (!token) {
    next('/login')
    return
  }
  const role = getUserRole()
  if (role && roles.includes(role)) {
    next()
  } else {
    next('/')
  }
}

