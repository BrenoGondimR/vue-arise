import { createRouter, createWebHistory } from 'vue-router'
import { ERouteNames } from "@/enums/ERouteNames";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: ERouteNames.GENERAL_ROUTE_NAME,
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
