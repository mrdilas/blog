import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue' 
import RegisterView from '../views/RegisretView.vue'
import ProfileView from '../views/ProfileView.vue'
import NewsView from '../views/NewsView.vue'
import AdminView from '../views/AdminView.vue'

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
    meta: { requiresAuth: false }
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
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true, role: 'user' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Навигационный гард для проверки авторизации
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated')
  const userRole = localStorage.getItem('userRole')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/') // Перенаправляем на страницу входа
  } else if (to.meta.requiresAuth && to.meta.role !== userRole) {
    // Если роль не соответствует
    next(userRole === 'admin' ? '/admin' : '/user')
  } else {
    console.log('[Навигация] from:', from.path, 'to:', to.path);
    next() // Продолжаем навигацию
  }
})

export default router