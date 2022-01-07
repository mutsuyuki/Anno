import Vue from 'vue'
import VueRouter from 'vue-router'
import Home_Hair from '../app/hair_annotation/Home_Hair.vue'
import Home_Track from "@/app/track_annotation/Home_Track.vue";
import Home_ObjectDetection from "@/app/object_detection_annotation/Home_ObjectDetection.vue";
import Home_ObjectDetection_ByImages from "@/app/object_detection_annotation/Home_ObjectDetection_ByImages.vue";
import Home_MovieCrop from "@/app/movie_crop/Home_MovieCrop.vue";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    // name: 'Home_Hair',
    // component: Home_Hair

    name: 'Home_MovieCrop',
    component: Home_MovieCrop

    // name: 'Home_Track',
    // component: Home_Track

    // name: 'Home_ObjectDetection',
    // component: Home_ObjectDetection

    // name: 'Home_ObjectDetection_ByImage',
    // component: Home_ObjectDetection_ByImages
  },

];

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router
