import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/panorama-list/:id?",
      name: "panoramaList",
      component: () => import("../views/panoramaListView.vue"),
      props: true,
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/panorama/:id?",
      name: "panorama",
      component: () => import("../views/panoramaShowView.vue"),
      props: true,
    },
    {
      path: "/storehouse",
      name: "storehouse",
      component: () => import("../views/StorehouseView.vue"),
    },
    {
      path: "/folder/:id",
      name: "folder",
      component: () => import("../views/FolderView.vue"),
      props: true,
    },
  ],
});

export default router;
