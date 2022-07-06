import Vue from 'vue'
import VueRouter from 'vue-router'
import * as PoreHome from '@/app/pore/Home.vue'
import * as PoseTrackingHome from "@/app/pose_tracking/Home.vue";
import * as ObjectDetectionHome from "@/app/object_detection/Home.vue";
// import * as ObjectDetectionHome_ByImages from "@/app/object_detection/Home_ByImages.vue";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',

    // name: 'PoreHome',
    // component: PoreHome.default,

    // name: 'PoseTrackingHome',
    // component: PoseTrackingHome.default,

    name: 'ObjectDetectionHome',
    component: ObjectDetectionHome.default,

    // name: 'ObjectDetectionHome_ByImages',
    // component: ObjectDetectionHome_ByImages.default,
  },

];

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router
