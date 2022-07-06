<template>
  <div v-show="isVideoSelected">
    <ToolBar/>

    <AnnotationStatusBar
        class="annotation-status-bar"
        :fileName="currentFileNameFull"
        :isUseAnnotationFile="isUseAnnotationFile"
        :isDownloaded="isDownloaded"
    />

    <VideoPlayer
        :frameForSeek="seekFrame"
        :createBlobSignal="createBlobSignal"
        :markerTimes="annotatedFrames"
        :overlayOpacity="overlayOpacity"
        @dragareastart="dragStartPosition = $event"
        @dragarea="draggingPosition = $event"
        @dragareaend="dragEndPosition = $event"
        @hover="hoverPosition = $event"
        @download="onDownload"
        @timeupdate="onFrameUpdate"
        @prepareBlob="onPrepareBlob"
    >
      <BoundingBoxOverlay
          :boundingBoxModels="boundingBoxes"
          :selectingObjectId="selectingObjectId"
          :useInteraction="true"
          :isDeleteMode="isDeleteMode"
          :dragStartPosition="dragStartPosition"
          :draggingPosition="draggingPosition"
          :dragEndPosition="dragEndPosition"
          :hoverPosition="hoverPosition"
          :color="{r: 40, g: 80, b: 220, a: 1}"
          @resizestart="selectBoundingBox"
          @movestart="selectBoundingBox"
          @resize="updateBoundingBox"
          @move="updateBoundingBox"
          @resizeend="addHistory"
          @moveend="addHistory"
          @unselect="unselectBoundingBox"
          @delete="deleteBoundingBox"
      />
      <TextOverlay :labels="objectLabels" :opacity="opacity"/>
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
import VideoPlayer from "@/components/UI_Singleton/Player/VideoPlayer.vue";
import TextOverlay from "@/components/Canvas/Overlay/TextOverlay.vue";
import BoundingBoxOverlay from "@/components/Canvas/Overlay/BoundingBoxOverlay.vue";
import {BoundingBoxModel} from "@/common/model/BoundingBoxModel";
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import VideoPlayerStore from "@/components/UI_Singleton/Player/VideoPlayerStore";
import OperationStore from "@/app/object_detection/store/OperationStore";
import AnnotationsStore, {Annotation} from "@/app/object_detection/store/AnnotationsStore";
import EditSequencesStore, {EditSequence} from "@/store/EditSequenceStore";
import CanvasSettingsStore from "@/components/UI_Singleton/ToolBar/CanvasSettingsStore";
import ClassListStore from "@/app/object_detection/store/ClassListStore";

@Component({
  components: {
    BoundingBoxOverlay,
    TextOverlay,
    VideoPlayer,
    DownloadButton,
    ToolBar,
    AnnotationStatusBar,
    CanvasRenderer,
    ImagePlayer,
  }
})
export default class CanvasPane extends Vue {
  private isDeleteMode: boolean = false;

  private dragStartPosition: MovingPoint = MovingPointUtil.zero();
  private draggingPosition: MovingPoint = MovingPointUtil.zero();
  private dragEndPosition: MovingPoint = MovingPointUtil.zero();
  private hoverPosition: Point = PointUtil.zero();

  private frame: string = "";       // ビデオのフレームと、OperationStore上の現在フレームに差分検知用
  private createBlobSignal: boolean = false;

  get currentFileNameFull() {
    return VideoPlayerStore.name;
  }

  get isVideoSelected() {
    return VideoPlayerStore.isSelected;
  }

  get seekFrame(): number {
    return Number(this.frame == OperationStore.frame ? -1 : OperationStore.frame);
  }

  get annotatedFrames(): number[] {
    return Object.keys(AnnotationsStore.annotations)
        .map(v => Number(v))
        .sort((a, b) => a > b ? 1 : a < b ? -1 : 0);
  }

  get overlayOpacity() {
    return CanvasSettingsStore.opacity;
  }

  get boundingBoxes(): { [objectId: string]: BoundingBoxModel } {
    let result = {} as any;
    const annotations = this.annotationsOfCurrentFrame;
    for (const objectId in annotations) {
      result[objectId] = annotations[objectId].bounding;
    }
    return result;
  }

  get selectingObjectId() {
    return OperationStore.selectingObjectId;
  }

  get operationOfCurrentFrame(): EditSequence {
    return EditSequencesStore.sequences[OperationStore.frame] || {};
  }

  get isUseAnnotationFile() {
    return this.operationOfCurrentFrame.isUseAnnotationFile;
  }

  get isDownloaded() {
    return this.operationOfCurrentFrame.isDownloaded && !this.operationOfCurrentFrame.isDirty;
  }

  get annotationsOfCurrentFrame(): { [objectId: string]: Annotation } {
    return AnnotationsStore.annotations[OperationStore.frame] || {};
  }

  get opacity() {
    return CanvasSettingsStore.opacity;
  }

  get objectLabels(): { text: string, position: { x: string, y: string }, isActive: boolean }[] {
    let result = [];
    const annotations = this.annotationsOfCurrentFrame;
    for (const objectId in annotations) {
      const annotation = annotations[objectId];
      const className = ClassListStore.classList[annotation.class] || "???";
      result.push({
        text: annotation.class + " : " + className,
        position: {
          x: annotation.bounding.left * 100 + "%",
          y: annotation.bounding.top * 100 + "%"
        },
        isActive: objectId == OperationStore.selectingObjectId
      })
    }
    return result;
  }

  created() {
    // フレームが変わった
    this.$watch(
        () => OperationStore.frame,
        () => EditSequencesStore.createIfNothing(OperationStore.frame),
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

  private async restoreAnnotation() {
    AnnotationsStore.clear();

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

      AnnotationsStore.setAnnotationsOfFrame({
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

  private selectBoundingBox(objectId: string) {
    OperationStore.setSelectingObjectId(objectId)
  }

  private unselectBoundingBox() {
    OperationStore.setSelectingObjectId("")
  }

  private updateBoundingBox(objectId: string, bounding: BoundingBoxModel) {
    AnnotationsStore.setBounding({
      frame: OperationStore.frame,
      objectId: objectId,
      bounding: bounding
    });
  }

  private deleteBoundingBox(objectId: string) {
    AnnotationsStore.deleteObject({
      frame: OperationStore.frame,
      objectId: objectId,
    });

    this.addHistory();
  }

  private addHistory() {
    this.$emit("addHistory")
  }

  private onFrameUpdate(frame: number): void {
    this.frame = frame.toString();
    OperationStore.setFrame(this.frame);
  }

  private async onDownload() {
    this.createBlobSignal = !this.createBlobSignal;
  }

  private onPrepareBlob(videoImageBlob: Blob) {
    const fileName = FileUtil.removeExtension(this.currentFileNameFull) + "___" + OperationStore.frame + "___";
    FileDownloader.downloadBlob(fileName + ".png", videoImageBlob);

    const json = JSON.stringify(this.annotationsOfCurrentFrame);
    FileDownloader.downloadJsonFile(fileName + ".json", json);

    EditSequencesStore.setIsDownloaded({frame: OperationStore.frame, isDownloaded: true});
    EditSequencesStore.setIsDirty({frame: OperationStore.frame, isDirty: false});
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
