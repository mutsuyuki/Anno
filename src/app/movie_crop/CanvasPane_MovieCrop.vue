<template>
  <div v-show="VideoPlayerStore_.isSelected">
    <ToolBar/>

    <AnnotationStatusBar
        class="annotation-status-bar"
        :fileName="VideoPlayerStore_.name"
        :isUseAnnotationFile="operationOfCurrentFrame.isUseAnnotationFile"
        :isDownloaded="operationOfCurrentFrame.isDownloaded && !operationOfCurrentFrame.isDirty"
    />

    <VideoPlayer
        :seekFrame="seekFrame"
        :createBlobSignal="createBlobSignal"
        :markerTimes="annotatedFrames"
        :overlayOpacity="CanvasSettingsStore_.opacity"
        @dragareastart="dragStartPosition = $event"
        @dragarea="draggingPosition = $event"
        @dragareaend="dragEndPosition = $event"
        @hover="hoverPosition = $event"
        @download="onDownload"
        @timeupdate="onTimeUpdate"
        @prepareBlob="()=> {}"
        @prepareContext="onPrepareContext"
    >
      <BoundingBoxOverlay
          :boundingBoxModels="BoundingBoxes"
          :selectingObjectId="selectingObjectId"
          :useInteraction="true"
          :isDeleteMode="isDeleteMode"
          :dragStartPosition="dragStartPosition"
          :draggingPosition="draggingPosition"
          :dragEndPosition="dragEndPosition"
          :hoverPosition="hoverPosition"
          :color="{r: 220, g: 80, b: 40, a: 1}"
          @resizestart="onChangeStartBoundingBox"
          @movestart="onChangeStartBoundingBox"
          @resize="onResizeBoundingBox"
          @move="onMoveBoundingBox"
          @resizeend="onChangeEndBoundingBox"
          @moveend="onChangeEndBoundingBox"
          @unselect="onUnselectBoundingBox"
          @delete="onDeleteBoundingBox"
      />

    </VideoPlayer>

    <DownloadButton
        class="download-button"
        @download="onDownload"
    />

  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import ImagePlayer from "@/components/UI_Singleton/Player/ImagePlayer.vue";
import CanvasRenderer from "@/components/Canvas/Renderer/CanvasRenderer.vue";
import {MovingPoint, MovingPointUtil, Point, PointUtil} from "@/common/interface/Point";
import FileUtil from "@/common/utils/FileUtil";
import AnnotationStatusBar from "@/components/AnnotationStatusBar.vue";
import FileDownloader from "@/common/utils/FileDownloader";
import ToolBar from "@/components/UI_Singleton/ToolBar/ToolBar.vue";
import DownloadButton from "@/components/UI/Button/DownloadButton.vue";
import VideoPlayerStore from "@/components/UI_Singleton/Player/VideoPlayerStore";
import VideoPlayer from "@/components/UI_Singleton/Player/VideoPlayer.vue";
import OperationStore_MovieCrop from "@/app/movie_crop/store/OperationStore_MovieCrop";
import AnnotationsStore_MovieCrop, {Annotation_MovieCrop} from "@/app/movie_crop/store/AnnotationsStore_MovieCrop";
import TextOverlay from "@/components/Canvas/Overlay/TextOverlay.vue";
import EditSequencesStore, {EditSequence} from "@/store/EditSequenceStore";
import CanvasSettingsStore from "@/components/UI_Singleton/ToolBar/CanvasSettingsStore";
import BoundingBoxOverlay from "@/components/Canvas/Overlay/BoundingBoxOverlay.vue";
import {BoundingBoxModel} from "@/common/model/BoundingBoxModel";

const moment = require('moment');

@Component({
  components: {
    BoundingBoxOverlay,
    MultiLabels: TextOverlay,
    VideoPlayer,
    DownloadButton,
    ToolBar,
    AnnotationStatusBar,
    CanvasRenderer,
    ImagePlayer,
  }
})
export default class CanvasPane_MovieCrop extends Vue {
  private isDeleteMode: boolean = false;

  private dragStartPosition: MovingPoint = MovingPointUtil.zero();
  private draggingPosition: MovingPoint = MovingPointUtil.zero();
  private dragEndPosition: MovingPoint = MovingPointUtil.zero();
  private hoverPosition: Point = PointUtil.zero();

  private frame: string = "";       // ビデオのフレームと、OperationStore上の現在フレームに差分検知用
  private createBlobSignal: boolean = false;  // VideoPlayerに画像のBlobを作成依頼するトリガー用

  private outputTextureCanvas: HTMLCanvasElement = document.createElement("canvas");

  get seekFrame(): number {
    return Number(this.frame == OperationStore_MovieCrop.frame ? -1 : OperationStore_MovieCrop.frame);
  }

  get VideoPlayerStore_() {
    return VideoPlayerStore;
  }

  get CanvasSettingsStore_() {
    return CanvasSettingsStore;
  }

  get selectingObjectId() {
    return OperationStore_MovieCrop.selectingObjectId;
  }

  get operationOfCurrentFrame(): EditSequence {
    return EditSequencesStore.sequences[OperationStore_MovieCrop.frame] || {};
  }

  get annotatedFrames(): number[] {
    return Object.keys(AnnotationsStore_MovieCrop.annotations)
        .map(v => Number(v))
        .sort((a, b) => a > b ? 1 : a < b ? -1 : 0);
  }

  get currentAnnotations(): { [objectId: string]: Annotation_MovieCrop } {
    return AnnotationsStore_MovieCrop.annotations[OperationStore_MovieCrop.frame] || {};
  }

  get BoundingBoxes(): { [objectId: string]: BoundingBoxModel } {
    let result = {} as any;
    const annotations = this.currentAnnotations;
    for (const objectId in annotations) {
      result[objectId] = annotations[objectId].bounding;
    }
    return result;
  }

  created() {
    // フレームが変わった
    this.$watch(
        () => OperationStore_MovieCrop.frame,
        () => EditSequencesStore.createIfNothing(OperationStore_MovieCrop.frame),
        {deep: true, immediate: true}
    );

    // 削除用のCtrlキー検出
    document.addEventListener("keydown", (e) => {
      if (e.key == "Control") {
        this.isDeleteMode = true;
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.key == "Control") {
        this.isDeleteMode = false;
      }
    })
  }

  private onTimeUpdate(frame: number): void {
    this.frame = frame.toString();
    OperationStore_MovieCrop.setFrame(this.frame);
  }


  // --- bounding box overlay callback ------------------------------------------
  private onChangeStartBoundingBox(objectId: string) {
    // bodyの矩形を押下した場合モード関係なく選択状態にする
    OperationStore_MovieCrop.setSelectingObjectId(objectId);
  }

  private onMoveBoundingBox(objectId: string, bounding: BoundingBoxModel) {
    const frame = OperationStore_MovieCrop.frame;
    AnnotationsStore_MovieCrop.setBounding({
      frame: frame,
      objectId: objectId,
      bounding: bounding
    });
  }

  private onResizeBoundingBox(objectId: string, bounding: BoundingBoxModel) {
    const frame = OperationStore_MovieCrop.frame;
    AnnotationsStore_MovieCrop.setBounding({
      frame: frame,
      objectId: objectId,
      bounding: bounding
    });
  }

  private onChangeEndBoundingBox(objectId: string) {
    this.addHistory();
  }

  private onUnselectBoundingBox() {
    OperationStore_MovieCrop.setSelectingObjectId("");
  }

  private onDeleteBoundingBox(objectId: string) {
    const frame = OperationStore_MovieCrop.frame;
    AnnotationsStore_MovieCrop.deleteObject({
      frame: frame,
      objectId: objectId,
    });

    this.addHistory();
  }

  private addHistory() {
    this.$emit("addHistory")
  }

  private async onDownload() {
    this.createBlobSignal = !this.createBlobSignal;
  }

  private onPrepareContext(videoContext: CanvasRenderingContext2D) {

    const keys = Object.keys(this.currentAnnotations);
    if (keys.length <= 0) {
      alert("このフレームには切り取りエリアが設定されていません。")
      return;
    }

    // クロップサイズを取得
    const bbox = this.currentAnnotations[keys[keys.length - 1]].bounding;
    const cropLeft = Math.round(bbox.left * videoContext.canvas.width);
    const cropTop = Math.round(bbox.top * videoContext.canvas.height);
    const cropWidth = Math.round(bbox.width * videoContext.canvas.width);
    const cropHeight = Math.round(bbox.height * videoContext.canvas.height);


    // 出力サイズでキャンバスを初期化
    this.outputTextureCanvas.setAttribute("width", cropWidth.toString());
    this.outputTextureCanvas.setAttribute("height", cropHeight.toString());
    const context = this.outputTextureCanvas.getContext("2d");
    if (context == null) {
      alert("出力キャンバスの初期化に失敗しました")
      return;
    }

    // ビデオから選択領域をクロップ
    const croppedImageData = videoContext.getImageData(cropLeft, cropTop, cropWidth, cropHeight);
    context.putImageData(croppedImageData, 0, 0);

    // 出力
    const date = moment().format('YYYYMMDD_hhmmss');
    const fileName = FileUtil.removeExtension(VideoPlayerStore.name) + "___" + OperationStore_MovieCrop.frame + "___" + date;
    FileDownloader.downloadBlob(
        "ori_" + fileName + ".png",
        FileDownloader.editImageBlobFromCanvas(this.outputTextureCanvas)
    );

    EditSequencesStore.setIsDownloaded({frame: OperationStore_MovieCrop.frame, isDownloaded: true});
    EditSequencesStore.setIsDirty({frame: OperationStore_MovieCrop.frame, isDirty: false});

    // ------ パディングあり ---------------------------------
    // パディングありの出力サイズを計算
    const longEdge = Math.max(cropWidth, cropHeight);
    const outEdge = longEdge * OperationStore_MovieCrop.scale;

    // パディングありの出力サイズでキャンバスを初期化
    this.outputTextureCanvas.setAttribute("width", outEdge.toString());
    this.outputTextureCanvas.setAttribute("height", outEdge.toString());

    // 背景を塗りつぶす
    context.fillStyle = "rgb(0, 255, 0)";
    context.fillRect(0, 0, outEdge, outEdge)

    // ペースト位置を決定
    const pasteX = (outEdge - cropWidth) / 2;
    const pasteY = (outEdge - cropHeight) / 2;
    context.putImageData(croppedImageData, pasteX, pasteY);

    // 出力
    FileDownloader.downloadBlob(
        fileName + ".png",
        FileDownloader.editImageBlobFromCanvas(this.outputTextureCanvas)
    );
    EditSequencesStore.setIsDownloaded({frame: OperationStore_MovieCrop.frame, isDownloaded: true});
    EditSequencesStore.setIsDirty({frame: OperationStore_MovieCrop.frame, isDirty: false});
  }
}

</script>

<style scoped lang="scss">

.annotation-status-bar {
  margin-top: 16px;
}

.download-button {
  margin-top: 16px;
}

</style>
