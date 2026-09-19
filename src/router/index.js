import { createRouter, createWebHistory } from 'vue-router'
import { ROUTES } from '../config/routes'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // ถ้าใช้ Lenis ให้ใช้คำสั่งของ Lenis ในการเลื่อนขึ้นบนสุด
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true })
    }
    
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  },
  routes: [
    {
      path: ROUTES.HOME,
      name: 'home',
      component: HomeView,
    },
    {
      path: ROUTES.ABOUT,
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: ROUTES.AUTH.LOGIN,
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
    },
    {
      path: ROUTES.AUTH.REGISTER,
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
    },
    {
      path: ROUTES.BLOGS,
      name: 'blogs',
      component: () => import('../views/BlogListView.vue'),
    },
    {
      path: '/blogs/:id',
      name: 'blog_detail',
      component: () => import('../views/BlogDetailView.vue'),
    }
  ],
})
export default router
