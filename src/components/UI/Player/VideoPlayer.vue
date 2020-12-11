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
            <!-- 秒表記 -->
            {{ video.currentTime.toFixed(2) }} /
            <span style="opacity: 0.4">{{ video.duration.toFixed(2) }}</span>

            <!-- フレーム数表記 -->
            <!-- {{Math.round(this.video.currentTime / this.stepSec) }} /-->
            <!-- <span style="opacity: 0.4">{{Math.round(this.video.duration / this.stepSec)}}</span>-->
          </div>
        </div>

        <div class="timeline">
          <input type="range" min="0" :max="video.duration" :step="stepSec"
                 :value="timelineProgress"
                 @input="timeChange"
                 @mouseup="timeChangeEnd"
          />

          <div class="marker"
               v-for="markerPosition in markerPositions"
               :style="{'left' : markerPosition + '%'}"
          ></div>
        </div>
      </div>

      <div class="row row2">
        <button class="button" @click="back">
          <img :src="require('@/assets/img/icons/prev.svg')"/>
        </button>

        <div>
          <input type="number" min="0.03" max="100" step="0.01"
                 :value="stepSec"
                 @change="changeStepSec"
          >
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
import ScalableArea from "@/components/UI/ScalableArea/ScalableArea.vue";
import InlineSvg from "@/components/InlineSvg";
import NormalizedScalableArea from "@/components/UI/ScalableArea/NormalizedScalableArea.vue";
import VideoFileStore from "@/store/VideoFileStore";
import FileDownloader from "@/common/utils/FileDownloader";

@Component({
  components: {
    NormalizedScalableArea,
    InlineSvg,
    ScalableArea
  }
})
export default class VideoPlayer extends Vue {

  @Prop() private createBlobSignal!: boolean;
  @Prop() private frameForSeek!: number;
  @Prop() private markerTimes!: number[];

  private video: HTMLVideoElement = document.createElement("video");
  private videoTextureCanvas: HTMLCanvasElement = document.createElement("canvas");

  private timelineProgress: number = 0;
  private stepSec: number = 0.033333;    // 30fps --> 1frame 0.0333334sec   29.97fps --> 0.0333667sec
  private isShiftDown: boolean = false;

  get videoUrl() {
    return VideoFileStore.url;
  }

  get markerPositions() {
    return this.markerTimes.map(v => (v / this.video.duration) * 100);
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
      const stepedTime = this.getStepedSec(this.video.currentTime);
      const timeForFrame = Math.round(stepedTime * 1000) / 1000;
      this.$emit("timeupdate", timeForFrame);
    });

    this.video.addEventListener("pause", () => {
      this.applyStepedSec(this.video.currentTime);
    });

    this.$watch(
        () => this.frameForSeek,
        () => {
          if (this.frameForSeek != -1) {
            this.video.currentTime = this.frameForSeek
          }
        }
    );

    this.$watch(
        () => this.createBlobSignal,
        () => this.makeBlob()
    );

    document.addEventListener("keydown", (e) => {
      if (e.key == "Shift") {
        this.isShiftDown = true;
      }
      if (e.key == "ArrowRight") {
        if (this.isShiftDown) {
          this.nextData();
        } else {
          this.forward();
        }
      }
      if (e.key == "ArrowLeft") {
        if (this.isShiftDown) {
          this.prevData();
        } else {
          this.back();
        }
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.key == "Shift") {
        this.isShiftDown = false;
      }
    })
  }

  private applyStepedSec(time: number): void {
    const stepedSec = this.getStepedSec(time);
    this.timelineProgress = stepedSec;
    this.video.currentTime = stepedSec;
  }

  private getStepedSec(time: number): number {
    let stepedSec = Math.round(time / this.stepSec) * this.stepSec;
    stepedSec = Number(stepedSec.toFixed(10));   // 誤差の丸め
    return stepedSec;
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

  private nextData(): void {
    for (let i = 0; i < this.markerTimes.length; i++) {
      if (this.markerTimes[i] >= this.video.currentTime + 0.01) {
        this.applyStepedSec(this.markerTimes[i]);
        return;
      }
    }
    alert("これより後の時間には教師データはありません。")
  }

  private prevData(): void {
    for (let i = this.markerTimes.length - 1; i >= 0; i--) {
      if (this.markerTimes[i] <= this.video.currentTime - 0.01) {
        this.applyStepedSec(this.markerTimes[i]);
        return;
      }
    }
    alert("これより前の時間には教師データはありません。")
  }

  private timeChange(e: InputEvent): void {
    if (!e.target)
      return;

    this.applyStepedSec((e.target as HTMLInputElement).valueAsNumber);
  }

  private timeChangeEnd(e: MouseEvent): void {
    if (!e.target)
      return;

    this.applyStepedSec((e.target as HTMLInputElement).valueAsNumber);
  }

  private changeStepSec(e: InputEvent): void {
    const newStepSec = (e.target as HTMLInputElement).valueAsNumber;
    this.stepSec = Math.ceil(newStepSec * 10000000) / 10000000;
    this.applyStepedSec(this.video.currentTime);
  }

  private makeBlob() {
    // ビデオの画像
    this.videoTextureCanvas.setAttribute("width", this.video.videoWidth.toString());
    this.videoTextureCanvas.setAttribute("height", this.video.videoHeight.toString());
    const context = this.videoTextureCanvas.getContext("2d");
    if (!context) {
      alert("動画のテクスチャ取得に失敗しました")
      return;
    }

    context.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);
    const blob = FileDownloader.editImageBlobFromCanvas(this.videoTextureCanvas);
    this.$emit("prepareBlob", blob);
  }
}
</script>

<style scoped lang="scss">

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

      .time {
        width: 100%;
        text-align: center;
        line-height: 32px;
      }
    }

    .timeline {
      position: relative;
      width: 100%;

      input[type="range"] {
        width: 100%;
      }

      .marker {
        position: absolute;
        top: calc(50% - 8px);
        height: 16px;
        width: 1px;
        background-color: skyblue;
      }
    }

  }

  .row2 {
    & > *:nth-child(n+2) {
      margin-left: 16px;
    }

    margin-top: 8px;
    display: flex;
    justify-content: center;
    justify-items: center;

    input[type="number"] {
      font-size: 18px;
      width: 104px;
      height: 32px;
      text-align: center;
    }
  }


}

</style>