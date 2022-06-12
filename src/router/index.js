import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

export const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/home.vue'),
  },
  {
    path: '/custom-code',
    name: 'CustomCode',
    component: () => import(/* webpackChunkName customCode */ '@/views/customCode/index.vue'),
  },
  {
    path: '/q-editor',
    name: 'qEditor',
    component: () => import(/* webpackChunkName qEditor */ '@/views/qEditor/index.vue'),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
