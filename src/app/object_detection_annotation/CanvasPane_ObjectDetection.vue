<template>
  <div v-show="isVideoSelected" >
    <ToolBar/>

    <AnnotationStatusBar
        class="annotation-status-bar"
        :fileName="currentFileNameFull"
        :isUseAnnotationFile="isUseAnnotationFile"
        :isDownloaded="isDownloaded"
    />

    <VideoPlayer
        :frameForSeek="frameForSeek"
        :markerTimes="annotatedFrames"
        :createBlobSignal="createBlobSignal"
        @dragareastart="onDragStart"
        @dragarea="onDrag"
        @dragareaend="onDragEnd"
        @hover="onHover"
        @download="onDownload"
        @timeupdate="onFrameUpdate"
        @prepareBlob="onPrepareBlob"
    >
      <CanvasRenderer :graphics="graphics" :opacity="opacity"/>
      <MultiLabels :labels="objectLabels" :opacity="opacity"/>
    </VideoPlayer>

    <DownloadButton
        class="download-button"
        @download="onDownload"
    />

  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import ImagePlayer from "@/components/UI/Player/ImagePlayer.vue";
import CanvasRenderer from "@/components/Canvas/Renderer/CanvasRenderer.vue";
import {Graphic} from "@/components/Canvas/Renderer/Graphic";
import {MovingPoint, Point, PointUtil} from "@/common/interface/Point";
import {Color} from "@/common/interface/Color";
import FileUtil from "@/common/utils/FileUtil";
import AnnotationStatusBar from "@/components/AnnotationStatusBar.vue";
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import FileDownloader from "@/common/utils/FileDownloader";
import ToolBar from "@/components/ToolBar.vue";
import DownloadButton from "@/components/UI/Button/DownloadButton.vue";
import VideoFileStore from "@/store/VideoFileStore";
import VideoPlayer from "@/components/UI/Player/VideoPlayer.vue";
import OperationStore_ObjectDetection from "@/app/object_detection_annotation/store/OperationStore_ObjectDetection";
import AnnotationsStore_ObjectDetection, {Annotation_ObjectDetection} from "@/app/object_detection_annotation/store/AnnotationsStore_ObjectDetection";
import RectangleLine from "@/components/Canvas/Renderer/RectangleLine";
import DeepCloner from "@/common/utils/DeepCloner";
import MultiLabels from "@/components/Canvas/Overlay/MultiLabels.vue";
import EditSequencesStore, {EditSequence} from "@/store/EditSequenceStore";
import ClassesStore from "@/store/ClassesStore";
import CanvasSettingsStore from "@/store/CanvasSettingsStore";

@Component({
  components: {
    MultiLabels,
    VideoPlayer,
    DownloadButton,
    ToolBar,
    AnnotationStatusBar,
    CanvasRenderer,
    ImagePlayer,
  }
})
export default class CanvasPane_ObjectDetection extends Vue {
  private graphics: Graphic[] = [];

  private lineColors: { [id: string]: Color } = {
    "0": {r: 220, g: 60, b: 0, a: 1},
    "1": {r: 60, g: 0, b: 220, a: 1}
  };

  private createBlobSignal: boolean = false;
  private isDeleteMode: boolean = false;

  private frame: string = "";       // ビデオのフレームと、OperationStore上の現在フレームに差分検知用

  get currentFileNameFull() {
    return VideoFileStore.name;
  }

  get isVideoSelected() {
    return VideoFileStore.isSelected;
  }

  get frameForSeek(): number {
    return Number(this.frame == OperationStore_ObjectDetection.frame ? -1 : OperationStore_ObjectDetection.frame);
  }

  get annotatedFrames(): number[] {
    return Object.keys(AnnotationsStore_ObjectDetection.annotations)
        .map(v => Number(v))
        .sort((a, b) => a > b ? 1 : a < b ? -1 : 0);
  }

  get operationOfCurrentFrame(): EditSequence {
    return EditSequencesStore.sequences[OperationStore_ObjectDetection.frame] || {};
  }

  get isUseAnnotationFile() {
    return this.operationOfCurrentFrame.isUseAnnotationFile;
  }

  get isDownloaded() {
    return this.operationOfCurrentFrame.isDownloaded && !this.operationOfCurrentFrame.isDirty;
  }

  get annotationsOfCurrentFrame(): { [objectId: string]: Annotation_ObjectDetection } {
    return AnnotationsStore_ObjectDetection.annotations[OperationStore_ObjectDetection.frame] || {};
  }

  get opacity() {
    return CanvasSettingsStore.opacity;
  }

  get objectLabels(): { text: string, position: Point, isActive: boolean }[] {
    let result = [];
    const annotations = this.annotationsOfCurrentFrame;
    for (const objectId in annotations) {
      const annotation = annotations[objectId];
      const className = ClassesStore.classes[annotation.class] || "???";
      result.push({
        text: annotation.class + " : " + className,
        position: {x: annotation.bounding.left * 100, y: annotation.bounding.top * 100},
        isActive: objectId == OperationStore_ObjectDetection.selectingObjectId
      })
    }
    return result;
  }

  get selectingObject() {
    const frame = OperationStore_ObjectDetection.frame;
    if (!AnnotationsStore_ObjectDetection.annotations[frame])
      return null;

    const objectId = OperationStore_ObjectDetection.selectingObjectId;
    return AnnotationsStore_ObjectDetection.annotations[frame][objectId];
  }

  created() {
    // 表示対象のアノテーションたちの状態が変わった
    this.$watch(
        () => this.annotationsOfCurrentFrame,
        () => this.draw(),
        {deep: true}
    );

    // 選択対象やモードが変わった
    this.$watch(
        () => OperationStore_ObjectDetection.operation,
        () => this.draw(),
        {deep: true}
    );

    // フレームが変わった
    this.$watch(
        () => OperationStore_ObjectDetection.frame,
        () => EditSequencesStore.createIfNothing(OperationStore_ObjectDetection.frame),
        {deep: true, immediate: true}
    );

    // 教師データ読み込み
    this.$watch(
        () => AnnotationFilesStore.items,
        () => this.restoreAnnotation(),
        {deep: true}
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

  private draw() {
    this.graphics = [];

    for (const objectId in this.annotationsOfCurrentFrame) {
      const annotation = this.annotationsOfCurrentFrame[objectId];
      const isSelecting = OperationStore_ObjectDetection.selectingObjectId == objectId;

      const classId = annotation.class;
      const boundingColor = Object.assign({}, this.lineColors[classId], {a: isSelecting ? 1 : 0.5});
      const boundingBox = new RectangleLine(
          annotation.bounding.left,
          annotation.bounding.top,
          annotation.bounding.width,
          annotation.bounding.height,
          2,
          boundingColor
      );
      boundingBox.zIndex = 0;
      this.graphics.push(boundingBox);
    }
  }

  private async restoreAnnotation() {
    AnnotationsStore_ObjectDetection.clear();

    for (let i = 0; i < AnnotationFilesStore.items.length; i++) {
      const fileName = FileUtil.removeExtension(AnnotationFilesStore.items[i].name);
      const fileNameParts = fileName.split("___");
      const frame = fileNameParts[fileNameParts.length - 2];

      const fileText = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result || "");
        };
        reader.readAsText(AnnotationFilesStore.items[i]);
      });

      AnnotationsStore_ObjectDetection.setAnnotationsOfFrame({
        frame: frame,
        data: JSON.parse(fileText as string)
      });

      EditSequencesStore.setIsUseAnnotationFile({
        frame: frame,
        isUseAnnotationFile: true
      });
    }

    if (AnnotationFilesStore.items.length > 0) {
      this.addHistory();
    }
  }

  private onDragStart(e: MovingPoint) {
    // バウンディング
    const clickedBounding = this.searchBounding(e);
    if (this.isDeleteMode) {
      // 削除
      if (clickedBounding.objectId) {

        AnnotationsStore_ObjectDetection.deleteObject({
          frame: OperationStore_ObjectDetection.frame,
          objectId: clickedBounding.objectId
        });

        OperationStore_ObjectDetection.setSelectingObjectId("");
        OperationStore_ObjectDetection.setSelectingEdge({
          top: false,
          right: false,
          bottom: false,
          left: false
        });

        this.addHistory();
      }
    } else {
      // 選択
      OperationStore_ObjectDetection.setSelectingObjectId(clickedBounding.objectId);
      OperationStore_ObjectDetection.setSelectingEdge(clickedBounding.selectingEdge);
    }

  }

  private onDrag(e: MovingPoint) {
    if (this.selectingObject) {
      const frame = OperationStore_ObjectDetection.frame;
      const objectId = OperationStore_ObjectDetection.selectingObjectId;

      let bounding = DeepCloner.copy(this.selectingObject.bounding);

      const isEdgeSelect = Object.values(OperationStore_ObjectDetection.selectingEdge).filter(v => v).length >= 1;
      if (isEdgeSelect) {
        // 端のドラッグは矩形の拡大縮小
        if (OperationStore_ObjectDetection.selectingEdge.left) {
          bounding.left += e.deltaX;
          bounding.width -= e.deltaX;
        }
        if (OperationStore_ObjectDetection.selectingEdge.right) {
          bounding.width += e.deltaX;
        }
        if (OperationStore_ObjectDetection.selectingEdge.top) {
          bounding.top += e.deltaY;
          bounding.height -= e.deltaY;
        }
        if (OperationStore_ObjectDetection.selectingEdge.bottom) {
          bounding.height += e.deltaY;
        }
      } else {
        // 中心部ドラッグは移動
        bounding.top += e.deltaY;
        bounding.left += e.deltaX;
      }

      AnnotationsStore_ObjectDetection.setBounding({
        frame: frame,
        objectId: objectId,
        bounding: bounding
      });
    }

  }

  private onDragEnd(e: MovingPoint) {
    if (this.selectingObject && !this.isDeleteMode) {
      this.addHistory();
    }
  }

  private onHover(e: Point) {
    // do nothing
  }

  private searchBounding(position: Point) {
    let smallestArea = Number.MAX_VALUE;
    let smallestObjectId: string = "";
    let selectingEdge = {top: false, right: false, bottom: false, left: false};
    const edgeWidth = 0.02;

    for (const objectId in this.annotationsOfCurrentFrame) {
      const bounding = this.annotationsOfCurrentFrame[objectId].bounding;
      const x = position.x;
      const y = position.y;
      const insideHorizontal = (bounding.left - edgeWidth < x) && (x < bounding.left + bounding.width + edgeWidth);
      const insideVertical = (bounding.top - edgeWidth < y) && (y < bounding.top + bounding.height + edgeWidth);
      const area = bounding.width * bounding.height;
      if (insideHorizontal && insideVertical && area < smallestArea) {
        smallestObjectId = objectId;

        if (Math.abs(bounding.left - x) <= edgeWidth)
          selectingEdge.left = true;
        if (Math.abs(bounding.left + bounding.width - x) <= edgeWidth)
          selectingEdge.right = true;
        if (Math.abs(bounding.top - y) <= edgeWidth)
          selectingEdge.top = true;
        if (Math.abs(bounding.top + bounding.height - y) <= edgeWidth)
          selectingEdge.bottom = true;
      }
    }

    return {objectId: smallestObjectId, selectingEdge: selectingEdge};
  }

  private addHistory() {
    this.$emit("addHistory")
  }

  private onFrameUpdate(frame: number): void {
    this.frame = frame.toString();
    OperationStore_ObjectDetection.setFrame(this.frame);
  }

  private async onDownload() {
    this.createBlobSignal = !this.createBlobSignal;
  }

  private onPrepareBlob(videoImageBlob: Blob) {
    const fileName = FileUtil.removeExtension(this.currentFileNameFull) + "___" + OperationStore_ObjectDetection.frame + "___";
    FileDownloader.downloadBlob(fileName + ".png", videoImageBlob);

    const json = JSON.stringify(this.annotationsOfCurrentFrame);
    FileDownloader.downloadJsonFile(fileName + ".json", json);

    EditSequencesStore.setIsDownloaded({frame: OperationStore_ObjectDetection.frame, isDownloaded: true});
    EditSequencesStore.setIsDirty({frame: OperationStore_ObjectDetection.frame, isDirty: false});
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
