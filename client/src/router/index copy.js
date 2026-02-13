import { createRouter, createWebHistory } from 'vue-router'
import ProductList from '../views/ProductList.vue'
import ProductForm from '../views/ProductForm.vue'
import CategoryList from '../views/CategoryList.vue' // สร้างไฟล์นี้ทีหลังก็ได้

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/products' },
    { path: '/products', component: ProductList },
    { path: '/product/add', component: ProductForm },
    { path: '/product/edit/:id', component: ProductForm },
    { path: '/categories', component: CategoryList } 
  ]
})

export default router