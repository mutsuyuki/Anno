<template>
  <div v-show="isImagesSelected">
    <ToolBar
        :annotationOpacity="annotationOpacity"
        @annotationOpacity="annotationOpacity = $event"
    />

    <AnnotationStatusBar
        class="annotation-status-bar"
        :fileName="currentFileNameFull"
        :isUseAnnotationFile="isUseAnnotationFile"
        :isDownloaded="isDownloaded"
    />

    <ImagePlayer
        :srcUrls="imageUrls"
        :seekFrame="seekFrame"
        :markerTimes="annotatedFrames"
        :overlayOpacity="annotationOpacity"
        @pageupdate="onFrameUpdate"
        @dragareastart="onDragStart"
        @dragarea="onDrag"
        @dragareaend="onDragEnd"
        @download="onDownload"
    >
      <CanvasRenderer :graphics="graphics"/>
    </ImagePlayer>

    <DownloadButton
        class="download-button"
        @download="onDownload"
    />

    <div class="width-slider-container"
         v-show="isLineWidthMode"
    >
      <input type="range" v-model="widthValue" min="0.000001" max="0.01" step="0.000001">
      <button @click="onClickOverlay">決定</button>
    </div>

  </div>
</template>

<script lang="ts">

import {Component, Vue} from 'vue-property-decorator';
import Circle from "@/components/Canvas/Renderer/Circle";
import ScaleLine from "@/components/Canvas/Renderer/ScaleLine";
import {Graphic} from "@/components/Canvas/Renderer/Graphic";
import {MovingPoint, Point, PointUtil} from "@/common/interface/Point";
import {Color} from "@/common/interface/Color";
import FileUtil from "@/common/utils/FileUtil";
import AnnotationStatusBar from "@/components/UI/AnnotationStatusBar/AnnotationStatusBar.vue";
import FileDownloader from "@/common/utils/FileDownloader";
import DownloadButton from "@/components/UI/Button/DownloadButton.vue";
import ToolBar from "@/components/UI_Singleton/ToolBar/ToolBar.vue";
import ImagePlayer from "@/components/UI/Player/ImagePlayer.vue";
import CanvasRenderer from "@/components/Canvas/Renderer/CanvasRenderer.vue";
import EditStateStore, {EditState} from "@/store/EditStateStore";
import OperationStore from "@/app/pore/store/OperationStore";
import AnnotationsStore, {Annotation} from "@/app/pore/store/AnnotationsStore";
import FileStore from "@/app/pore/store/FileStore";


enum MODE {
  IDLE,
  LINE_DIRECTION,
  LINE_WIDTH,
}

@Component({
  components: {
    DownloadButton,
    ToolBar,
    AnnotationStatusBar,
    CanvasRenderer,
    ImagePlayer,
  }
})

export default class CanvasPane extends Vue {
  private graphics: Graphic[] = [];
  private circleColor: Color = {r: 150, g: 0, b: 0, a: 1};
  private lineColor: Color = {r: 0, g: 0, b: 150, a: 1};
  private annotationOpacity: number = 1;

  private frame: string = "";       // PlayerのフレームとOperationStoreのフレームの差分検知用

  private mode: MODE = MODE.IDLE;
  private isDeleteMode: boolean = false;
  private widthValue: number = 0.1;
  private unWatchWidthValue!: Function;

  created() {
    // 表示対象のアノテーションたちの状態が変わった
    this.$watch(
        () => this.annotationsOfCurrentFrame,
        () => this.draw(),
        {deep: true}
    );

    // 選択対象やモードが変わった
    this.$watch(
        () => OperationStore.operation,
        () => this.draw(),
        {deep: true}
    );

    // フレームが変わった
    this.$watch(
        () => OperationStore.frame,
        () => EditStateStore.createIfNothing(OperationStore.frame),
        {deep: true, immediate: true}
    );

    // 教師データ読み込み
    this.$watch(
        () => FileStore.annotationFiles,
        () => this.restoreAnnotation(),
        {deep: true}
    );

    // 移動用のCtrlキー検出
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

  get isImagesSelected() {
    return FileStore.isImageFilesSelected;
  }

  get isLineWidthMode() {
    return this.mode == MODE.LINE_WIDTH;
  }

  get imageUrls() {
    return FileStore.imageUrls;
  }

  get currentFileNameFull() {
    const imageIndex = parseInt(OperationStore.frame);
    return FileStore.imageNames[imageIndex];
  }

  get seekFrame(): number {
    return Number(this.frame == OperationStore.frame ? -1 : OperationStore.frame);
  }

  get annotatedFrames(): number[] {
    return Object.keys(AnnotationsStore.annotations)
        .map(v => Number(v))
        .sort((a, b) => a > b ? 1 : a < b ? -1 : 0);
  }

  get isUseAnnotationFile() {
    return this.operationOfCurrentFrame.isUseAnnotationFile;
  }

  get isDownloaded() {
    return this.operationOfCurrentFrame.isDownloaded && !this.operationOfCurrentFrame.isDirty;
  }

  get operationOfCurrentFrame(): EditState {
    return EditStateStore.states[OperationStore.frame] || ({} as EditState);
  }

  get annotationsOfCurrentFrame(): { [objectId: string]: Annotation } {
    return AnnotationsStore.annotations[OperationStore.frame] || {};
  }

  get selectingObject() {
    const frame = OperationStore.frame;
    if (!AnnotationsStore.annotations[frame])
      return null;

    const objectId = OperationStore.selectingObjectId;
    return AnnotationsStore.annotations[frame][objectId];
  }

  private onFrameUpdate(frame: number): void {
    this.frame = frame.toString();
    OperationStore.setFrame(this.frame);
  }

  private draw() {
    this.graphics = [];
    for (const objectId in this.annotationsOfCurrentFrame) {
      const annotation = this.annotationsOfCurrentFrame[objectId];
      const isSelecting = OperationStore.selectingObjectId == objectId;

      const circle = new Circle(annotation.start, 2, this.circleColor);
      circle.zIndex = 1;
      this.graphics.push(circle);

      const line = new ScaleLine(annotation.start, annotation.end, annotation.width, this.lineColor);
      line.zIndex = 0;
      this.graphics.push(line);
    }
  }

  private async restoreAnnotation() {
    AnnotationsStore.clear();

    for (let i = 0; i < FileStore.annotationFiles.length; i++) {
      const frame = FileUtil.removeExtension(FileStore.annotationFiles[i].name);

      const fileText = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result || "");
        };
        reader.readAsText(FileStore.annotationFiles[i]);
      });

      AnnotationsStore.setAnnotationsOfFrame({
        frame: frame,
        data: JSON.parse(fileText as string)
      });

      EditStateStore.setIsUseAnnotationFile({
        frame: frame,
        isUseAnnotationFile: true
      });
    }

    if (FileStore.annotationFiles.length > 0) {
      this.addHistory();
    }
  }

  private onDragStart(e: MovingPoint) {
    if (this.mode != MODE.IDLE)
      return;

    if (!this.isDeleteMode) {
      // 点を追加
      this.mode = MODE.LINE_DIRECTION;

      AnnotationsStore.create({
        frame: OperationStore.frame,
        annotation: {
          start: {x: e.x, y: e.y},
          end: {x: e.x, y: e.y},
          width: 0.001
        },
      })

      OperationStore.setSelectingObjectId(AnnotationsStore.newestObjectId);
    } else {
      // 削除
      const threshold = 0.05;
      let nearestPointId = "";
      let nearestDistance = Number.MAX_VALUE;
      for (const objectId in this.annotationsOfCurrentFrame) {
        const annotation = this.annotationsOfCurrentFrame[objectId];
        const distance = PointUtil.distance(annotation.start, e);
        if (distance < threshold && distance < nearestDistance) {
          nearestPointId = objectId;
          nearestDistance = distance;
        }
      }

      if (nearestPointId != "") {
        AnnotationsStore.deleteObject({
          frame: OperationStore.frame,
          objectId: nearestPointId
        });

      }
    }
  }

  private onDrag(e: MovingPoint) {
    if (this.mode != MODE.LINE_DIRECTION)
      return;

    AnnotationsStore.setEnd({
      frame: OperationStore.frame,
      objectId: OperationStore.selectingObjectId,
      end: {x: e.x, y: e.y}
    });
  }

  private onDragEnd(e: MovingPoint) {
    if (this.mode != MODE.LINE_DIRECTION)
      return;

    this.mode = MODE.LINE_WIDTH;

    const selectingObject = this.selectingObject;
    if (!selectingObject)
      return;

    this.widthValue = selectingObject.width;

    this.unWatchWidthValue = this.$watch(
        () => this.widthValue,
        () => this.onChangeWidthValue(),
        {immediate: true}
    );
  }

  private onChangeWidthValue() {
    AnnotationsStore.setWidth({
      frame: OperationStore.frame,
      objectId: OperationStore.selectingObjectId,
      width: this.widthValue
    });
  }

  private onClickOverlay(e: MouseEvent) {
    this.unWatchWidthValue();
    this.mode = MODE.IDLE;
    this.addHistory();
  }

  private async onDownload() {
    const imageIndex = parseInt(OperationStore.frame);
    const file = FileStore.loadedFiles.imageFiles[imageIndex];
    FileDownloader.downloadBlob(file.name, file);

    const json = JSON.stringify(this.annotationsOfCurrentFrame);
    FileDownloader.downloadJsonFile(file.name + ".json", json);

    EditStateStore.setIsDownloaded({frame: OperationStore.frame, isDownloaded: true});
    EditStateStore.setIsDirty({frame: OperationStore.frame, isDirty: false});
  }

  private addHistory() {
    this.$emit("addHistory")
  }
}

</script>

<style scoped lang="scss">

.annotation-pane {
  padding: 0 16px;
}

.annotation-status-bar {
  margin-top: 16px;
}

.download-button {
  margin-top: 16px;
}

.width-slider-container {
  position: fixed;
  top: calc(40px + 40px);
  right: 16px;
  width: calc(100vw - 200px - 16px - 16px);
  height: 24px;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;

  input[type="range"] {
    width: 85%;
    margin-left: 8px;
  }

  button {
    width: 15%;
    height: 24px;
    font-size: 12px;
    margin-left: 8px;
    padding: 0px;
    background: rgba(black, 0.5);
  }
}


</style>
