import Vue from 'vue'
import VueRouter from 'vue-router'
import * as ObjectDetectionHome from "@/app/object_detection/Home.vue";
import * as PoreDetectionHome from '@/app/pore_detection/Home.vue'
import * as EmotionClassificationHome from '@/app/emotion_classification/Home.vue'
import * as KanbanDetectionHome from '@/app/kanban_detection/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',

    name: 'ObjectDetectionHome',
    component: ObjectDetectionHome.default,

    // name: 'PoreDetectionHome',
    // component: PoreDetectionHome.default,

    // name: 'EmotionClassificationHome',
    // component: EmotionClassificationHome.default,

    // name: 'KanbanDetectionHome',
    // component: KanbanDetectionHome.default,
  },

];

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router
