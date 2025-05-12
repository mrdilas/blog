import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue' 
import RegisterView from '../views/RegisretView.vue'
import ProfileView from '../views/ProfileView.vue'
import NewsView from '../views/NewsView.vue'
import AdminView from '../views/AdminView.vue'
import AddNewsView from '../views/AddNewsView.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/news',
    name: 'news',
    component: NewsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/add-news',
    name: 'AddNews',
    component: AddNewsView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Навигационный гард
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const userRole = localStorage.getItem('userRole')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/')
  } else if (to.meta.requiredRole && to.meta.requiredRole !== userRole) {
    // Перенаправляем пользователя на соответствующую страницу
    next(userRole === 'admin' ? '/admin' : '/news')
  } else {
    next()
  }
})

export default router