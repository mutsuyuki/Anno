<template>
  <img :src="url" alt="">
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import MediaSizeChecker from "@/components/SizeChecker/MediaSizeChecker.vue";

@Component
export default class ImageSizeChecker extends MediaSizeChecker {
}
</script>

