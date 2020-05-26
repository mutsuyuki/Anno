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
            <div class="image_area">
                <video :src="videoPath">
                    <canvas id="video-buffer"></canvas>
                    <div class="overlay-layer">
                        <slot></slot>
                    </div>
            </div>
        </NormalizedScalableArea>

        <div class="selector_area">
            <button class="button" @click="first">
                <img :src="require('@/assets/img/icons/prev_first.svg')"/>
            </button>

            <button class="button" @click="prev">
                <img :src="require('@/assets/img/icons/prev.svg')"/>
            </button>

            <div class="page_display">
                <input type="number" v-model="currentPage" placeholder="0">
                <span class="divider">/</span>
                <span class="total-page">{{totalPage}}</span>
            </div>

            <button class="button" @click="next">
                <img :src="require('@/assets/img/icons/next.svg')"/>
            </button>

            <button class="button" @click="last">
                <img :src="require('@/assets/img/icons/next_last.svg')"/>
            </button>
        </div>


        <!--
        <div class="video_control_area" >
            <button v-if="video.paused" class="button_wrapper" @click="play_">
                <img src="img/play.svg"/>
            </button>

            <button v-if="!video.paused" class="button_wrapper" @click="pause_">
                <img src="img/pause.svg"/>
            </button>

            <input type="number" @change="currentTimeChange_" :value="videoCurrentTime_.toFixed(1)" min="0.0"
                   :max="video.duration" step="0.1">

            <div class="range-container">
                <input type="range" min="0" max="1" step="0.000001" v-model="videoProgress_" @input="seek_">
                <div v-for="time in dataTimes" class="data-sign"
                     :style="{'left':(time.progress * 100) + '%', 'background': time.saveType == 'restore' ? '#ccc' : '#3da'}"></div>
            </div>

            <button class="button_wrapper" @click="download_">
                <img src="img/download.svg"/>
            </button>
        </div>

        <div class="video_control_area2" >
            <div>
                <input type="number" v-model="videoStepSec_" min="0.01" max="100" step="0.1">
                <span class="seconds-unit">秒</span>

                <button class="button_wrapper" @click="prev_">
                    <span>戻る</span>
                </button>

                <button class="button_wrapper" @click="forward_">
                    <span>進む</span>
                </button>
            </div>

            <div>
                <button class="button_wrapper2" @click="prev_data_">
                    <span>< 前データ確認</span>
                </button>

                <button class="button_wrapper2" @click="next_data_">
                    <span>次データ確認 ></span>
                </button>
            </div>

            <div>
                <button class="button_wrapper2" @click="toCash">
                    <span>キャッシュに保存</span>
                </button>

                <button class="button_wrapper2" @click="restoreByCash" :class="{'is-disable':!isExistCash}">
                    <span>キャッシュを戻す</span>
                </button>

                <button class="button_wrapper2" @click="restoreByHistory" :class="{'is-disable':matchedHistoryIndex < 0}">
                    <span>保存済データを戻す</span>
                </button>
            </div>
        </div>
        -->


    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import ScalableArea from "@/components/ScalableArea/ScalableArea.vue";
    import InlineSvg from "@/components/InlineSvg";
    import ImageFilesStore from "@/store/ImageFilesStore";
    import NormalizedScalableArea from "@/components/ScalableArea/NormalizedScalableArea.vue";

    @Component({
        components: {NormalizedScalableArea, InlineSvg, ScalableArea}
    })
    export default class VideoPlayer extends Vue {

        // private video: HTMLVideoElement;
        // private videoTextureCanvas: HTMLCanvasElement;

        // private videoProgress_: number = 0;
        // private videoStepSec_: number = 0.5;
        // private videoCurrentTime_: number = 0.0;

        get videoPath() {
            return ImageFilesStore.currentItem ? URL.createObjectURL(ImageFilesStore.currentItem) : "";
        }

        get currentPage() {
            return ImageFilesStore.currentIndex + 1;
        }

        set currentPage(value) {
            ImageFilesStore.setIndex(value)
        }

        get totalPage() {
            return ImageFilesStore.numberOfItems;
        }


        mounted() {
            // this.video = <HTMLVideoElement>document.getElementById("video_player");
            // this.videoTextureCanvas = <HTMLCanvasElement>document.getElementById("video_buffer");

            // JointListModel.instance().addListener(JointListModel.ON_RESTORE, () => {
            //     this.video.currentTime = 0;
            //     if (JointListModel.instance().history[0].time > 0)
            //         this.next_data_();
            //     this.drawCanvas()
            // });
            // JointListModel.instance().addListener(JointListModel.ON_JOINTS_SET_BY_HISTORY, (time) => {
            //     this.video.currentTime = time;
            //     this.drawCanvas();
            // });
            // JointListModel.instance().addListener(JointListModel.ON_JOINTS_RESTORE_BY_CASH, () => this.drawCanvas());
            // this.video.addEventListener("loadeddata", () => this.videoProgress_ = 0);
            // this.video.addEventListener("loadeddata", () => this.resizeCanvas());
            // this.video.addEventListener("timeupdate", () => {
            //     this.videoProgress_ = this.video.currentTime / this.video.duration
            //     this.videoCurrentTime_ = Number(this.video.currentTime.toFixed(5));
            // });

        }

        // private resizeCanvas(): void {
        //     this.annotationCanvas.setAttribute("width", this.video.clientWidth.toString());
        //     this.annotationCanvas.setAttribute("height", this.video.clientHeight.toString());
        //     this.maskCanvas.setAttribute("width", this.video.clientWidth.toString());
        //     this.maskCanvas.setAttribute("height", this.video.clientHeight.toString());
        //     this.drawCanvas();
        // }

        // private changeVideo(): void {
        //     this.srcUrl_ = URL.createObjectURL(FileSelectorsModel.instance().videoFile);
        // }
        //
        // private play(): void {
        //     this.video.play();
        // }
        //
        // private pause(): void {
        //     this.video.pause();
        // }
        //
        // private currentTimeChange(e: any) {
        //     this.videoProgress_ = e.srcElement.valueAsNumber / this.video.duration;
        //     this.videoProgress_ = Math.min(this.videoProgress_, 1);
        //     this.seek_();
        // }
        //
        // private forward(): void {
        //     this.videoProgress_ = (this.video.currentTime + Number(this.videoStepSec_)) / this.video.duration;
        //     this.videoProgress_ = Math.min(this.videoProgress_, 1);
        //     this.seek_();
        // }
        //
        // private prev(): void {
        //     this.videoProgress_ = (this.video.currentTime - Number(this.videoStepSec_)) / this.video.duration;
        //     this.videoProgress_ = Math.max(this.videoProgress_, 0);
        //     this.seek_();
        // }
        //
        // private seek(): void {
        //     const seekTime: number = this.videoProgress_ * this.video.duration;
        //     if (seekTime == this.video.currentTime)
        //         return;
        //
        //     // 近くにデータがあるか調べる
        //     let snapedSeekTime = seekTime;
        //     const halfStep = this.videoStepSec_ / 2;
        //     for (let i = 0; i < JointListModel.instance().history.length; i++) {
        //         const model = JointListModel.instance().history[i];
        //         if (Math.abs(model.time - seekTime) < halfStep) {
        //             snapedSeekTime = model.time;
        //             JointListModel.instance().jointsUpdateByHistory(i);
        //             break;
        //         }
        //     }
        //
        //     this.video.currentTime = snapedSeekTime;
        // }
        //
        // private prevData(): void {
        //     for (let i = JointListModel.instance().history.length - 1; i >= 0; i--) {
        //         const model = JointListModel.instance().history[i];
        //         if (model.time < this.video.currentTime) {
        //             JointListModel.instance().jointsUpdateByHistory(i);
        //             return;
        //         }
        //     }
        //     alert("これより前の時間には教師データはありません。")
        // }
        //
        // private nextData(): void {
        //     for (let i = 0; i < JointListModel.instance().history.length; i++) {
        //         const model = JointListModel.instance().history[i];
        //         if (model.time > this.video.currentTime) {
        //             JointListModel.instance().jointsUpdateByHistory(i);
        //             return;
        //         }
        //     }
        //     alert("これより後の時間には教師データはありません。")
        // }

    }
</script>

<style scoped lang="scss">
    @import "../../assets/scss/parts/button";
    @import "../../assets/scss/parts/input_text";

    .image_area {
        display: flex;
        justify-content: center;
        position: relative;

        img {
            width: 100%;
        }

        .overlay-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            pointer-events: none;

            .overlay-inner {
                position: absolute;
                top: 0;
                left: 0;
            }
        }
    }

    .download_panel {
        height: 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;

        button {
            width: 140px;
            min-width: 140px;

            span {
                margin-left: 8px;
                color: var(--gray);
            }
        }

        span {
            margin-left: 16px;
            color: var(--gray);
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            text-align: right;
        }
    }

    .selector_area {
        margin-top: 16px;
        display: flex;
        justify-content: center;
        align-items: center;

        button {
            margin: 0 8px;
        }

        .page_display {
            margin: 0 32px;
            display: flex;
            justify-content: center;
            align-items: flex-end;

            input[type="number"] {
                font-size: 18px;
                width: 64px;
                height: 32px;
                text-align: right;
            }

            .divider {
                font-size: 12px;
                margin-left: 8px;
                color: var(--darkgray);
            }

            .total-page {
                font-size: 12px;
                margin-left: 8px;
                color: var(--darkgray);
            }

        }
    }
</style>
