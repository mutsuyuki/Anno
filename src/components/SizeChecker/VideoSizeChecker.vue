<template>
    <video :src="url"></video>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import MediaSizeChecker from "@/components/SizeChecker/MediaSizeChecker.vue";

    @Component
    export default class VideoSizeChecker extends MediaSizeChecker {
    }
</script>

