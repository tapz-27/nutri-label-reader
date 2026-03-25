import { createRouter, createWebHistory } from 'vue-router'
import ScannerView from '../components/ScannerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ScannerView
    }
  ]
})

export default router
