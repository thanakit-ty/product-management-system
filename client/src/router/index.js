import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  {
    path: "/",
    name: "home",
    meta: { requiresAuth: true, title: "Dashboard" },
    component: () => import("../views/HomeView.vue"),
  },
  {
    path: "/products",
    name: "products",
    meta: { requiresAuth: true, title: "Product List" },
    component: () => import("../views/ProductListView.vue"),
  },
  {
    path: "/products/new",
    name: "product-new",
    meta: { requiresAuth: true, title: "Add Product" },
    component: () => import("../views/AddProductView.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginView.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/RegisterView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthed) {
    return { name: "login" };
  }

  if ((to.name === "login" || to.name === "register") && auth.isAuthed) {
    return { name: "home" };
  }
});

export default router;
