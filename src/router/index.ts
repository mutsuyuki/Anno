import Vue from 'vue'
import VueRouter from 'vue-router'
import * as ObjectDetectionHome from "@/app/object_detection/Home.vue";
import * as PoseTrackingHome from "@/app/pose_tracking/Home.vue";
import * as PoreHome from '@/app/pore/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',

    name: 'ObjectDetectionHome',
    component: ObjectDetectionHome.default,

    // name: 'PoseTrackingHome',
    // component: PoseTrackingHome.default,

    // name: 'PoreHome',
    // component: PoreHome.default,
  },

];

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router
