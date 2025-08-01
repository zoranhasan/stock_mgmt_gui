import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import SalesView from '../views/Sales.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },{
    path: '/sales',
    name: 'sales',
    component: SalesView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
