import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Auth from '../views/AuthPage.vue'
import AdminDashboard from '../views/AdminPage.vue'
import DynamicPage from '../views/DynamicPage.vue'
import UserProfile from '../views/UserProfile.vue'
import UserArticlePage from '../views/UserArticlePage.vue'
import Search from '../views/SearchPage.vue'
import Actualite from '../views/ActuPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/accueil'
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard
  },
  {
    path: '/:slug',
    name: 'DynamicPage',
    component: DynamicPage
  },
  {
    path: '/recherche',
    name: 'Search',
    component: Search
  },
  {
    path: '/actualites',
    name: 'Actualite',
    component: Actualite
  },
  {
    path: '/user/articles',
    name: 'UserArticlePage',
    component: UserArticlePage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
