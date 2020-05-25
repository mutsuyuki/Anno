import Vue from 'vue'
import VueRouter from 'vue-router'
import Home_Hair from '../app/hair_annotation/Home_Hair.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home_Hair',
    component: Home_Hair
  },

];

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router
