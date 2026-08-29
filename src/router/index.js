import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import SalesView from '../views/Sales.vue'
import PurchaseView from '../views/Purchase.vue'
import GoodsView from '../views/Goods.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },{
    path: '/sales',
    name: 'sales',
    component: SalesView
  },{
    path: '/purchase',
    name: 'purchase',
    component: PurchaseView
  },{
    path: '/goods',
    name: 'goods',
    component: GoodsView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
