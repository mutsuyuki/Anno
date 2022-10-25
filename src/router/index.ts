import Vue from 'vue'
import VueRouter from 'vue-router'
import * as ObjectDetectionHome from "@/app/object_detection/Home.vue";
import * as AnimalPoseTrackingHome from "@/app/animal_pose_tracking/Home.vue";
import * as PoreDetectionHome from '@/app/pore_detection/Home.vue'
import * as EmotionClassificationHome from '@/app/emotion_classification/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',

    name: 'ObjectDetectionHome',
    component: ObjectDetectionHome.default,

    // name: 'AnimalPoseTrackingHome',
    // component: AnimalPoseTrackingHome.default,

    // name: 'PoreDetectionHome',
    // component: PoreDetectionHome.default,

    // name: 'EmotionClassificationHome',
    // component: EmotionClassificationHome.default,

  },

];

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router
