<template>
    <div>
        <NormalizedScalableArea
                @dragareastart="$emit('dragareastart', $event)"
                @dragarea="$emit('dragarea', $event)"
                @dragareaend="$emit('dragareaend', $event)"
                @hover="$emit('hover', $event)"
                @movestart="$emit('movestart', $event)"
                @move="$emit('move', $event)"
                @moveend="$emit('moveend', $event)"
                @zoomstart="$emit('zoomstart', $event)"
                @zoom="$emit('zoom', $event)"
                @zoomend="$emit('zoomend', $event)"
        >
            <div class="video_area">
                <video id="video_player" :src="videoUrl"></video>
                <canvas id="video_buffer"></canvas>
                <div class="overlay_layer">
                    <slot></slot>
                </div>
            </div>
        </NormalizedScalableArea>


        <div class="video_control_area">

            <div class="row row1">

                <div class="except_timeline">
                    <button v-if="video.paused" class="button" @click="play">
                        <img :src="require('@/assets/img/icons/play.svg')"/>
                    </button>
                    <button v-if="!video.paused" class="button" @click="pause">
                        <img :src="require('@/assets/img/icons/pause.svg')"/>
                    </button>

                    <div class="time" v-show="video.duration > 0">
                        {{video.currentTime.toFixed(2)}} / <span style="opacity: 0.4">{{video.duration.toFixed(2)}}</span>
                    </div>
                </div>

                <div class="timeline">
                    <input type="range" min="0" :max="video.duration" step="0.033333334"
                           :value="timelineProgress"
                           @input="timeChange"
                    />
                </div>
            </div>

            <div class="row row2">
                <button class="button" @click="back">
                    <img :src="require('@/assets/img/icons/prev.svg')"/>
                </button>

                <div>
                    <input type="number" v-model="stepSec" min="0.01" max="100" step="0.01">
                    <span class="seconds-unit">sec</span>
                </div>

                <button class="button" @click="forward">
                    <img :src="require('@/assets/img/icons/next.svg')"/>
                </button>
            </div>

        </div>

    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import ScalableArea from "@/components/ScalableArea/ScalableArea.vue";
    import InlineSvg from "@/components/InlineSvg";
    import NormalizedScalableArea from "@/components/ScalableArea/NormalizedScalableArea.vue";
    import VideoFileStore from "@/store/VideoFileStore";

    @Component({
        components: {
            NormalizedScalableArea,
            InlineSvg,
            ScalableArea
        }
    })
    export default class VideoPlayer extends Vue {

        private video: HTMLVideoElement = document.createElement("video");   // dummy
        private videoTextureCanvas: HTMLCanvasElement = document.createElement("canvas");  // dummy

        private timelineProgress: number = 0;
        private stepSec: number = 0.03;    // 30fps --> 1frame 0.033333334sec
        get videoUrl() {
            return VideoFileStore.url;
        }

        mounted() {
            this.video = <HTMLVideoElement>document.getElementById("video_player");
            this.videoTextureCanvas = <HTMLCanvasElement>document.getElementById("video_buffer");

            this.video.addEventListener("loadeddata", () => {
                this.timelineProgress = 0;
                this.$forceUpdate();

                this.$emit("timeupdate", 0);
            });

            this.video.addEventListener("timeupdate", () => {
                this.timelineProgress = this.video.currentTime;
                this.$forceUpdate();

                this.$emit("timeupdate", this.video.currentTime);
            });
        }

        private play(): void {
            this.video.play();
        }

        private pause(): void {
            this.video.pause();
        }

        private forward(): void {
            this.video.currentTime += this.stepSec;
        }

        private back(): void {
            this.video.currentTime -= this.stepSec;
        }

        private timeChange(e: InputEvent): void {
            if (!e.target)
                return;

            this.video.currentTime = Number((e.target as HTMLInputElement).value);
        }
    }
</script>

<style scoped lang="scss">
    @import "../../assets/scss/parts/button";
    @import "../../assets/scss/parts/input_text";

    .video_area {
        display: flex;
        justify-content: center;
        position: relative;

        video {
            width: 100%;
        }

        canvas {
            position: absolute;
            top: 0;
            left: 0;
            visibility: hidden;
        }

        .overlay_layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            pointer-events: none;
        }
    }


    .video_control_area {
        .row1 {
            margin-top: 8px;
            display: flex;
            justify-items: center;

            .except_timeline {
                & > *:nth-child(n+2) {
                    margin-left: 8px;
                }

                display: flex;
                justify-items: center;
                width: 250px;

                .time{
                    width: 100%;
                    text-align: center;
                    line-height: 32px;
                }
            }

            .timeline {
                width: 100%;

                input[type="range"] {
                    width: 100%;
                }
            }

        }

        .row2 {
            & > *:nth-child(n+2) {
                margin-left: 8px;
            }

            margin-top: 8px;
            display: flex;
            justify-content: center;
            justify-items: center;

            input[type="number"] {
                font-size: 18px;
                width: 96px;
                height: 32px;
                text-align: right;
            }
        }


    }

</style>
