import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/home',
    component: () => import('@/sidepanel/views/home.vue'),
  },
  {
    path: '/settings',
    component: () => import('@/sidepanel/views/settings.vue'),
  },
  {
    path: '',
    redirect: '/home'
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

export default router
