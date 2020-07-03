import Vue from 'vue'
import VueRouter from 'vue-router'
import Home_Hair from '../app/hair_annotation/Home_Hair.vue'
import Home_Track from "@/app/track_annotation/Home_Track.vue";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    // name: 'Home_Hair',
    // component: Home_Hair

    name: 'Home_Track',
    component: Home_Track
  },

];

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router
