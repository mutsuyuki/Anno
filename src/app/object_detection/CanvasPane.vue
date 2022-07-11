<template>
  <div v-show="isVideoSelected || isImagesSelected">
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

    <VideoPlayer
        v-if="isVideoSelected"
        :srcUrl="videoUrl"
        :seekFrame="seekFrame"
        :markerTimes="annotatedFrames"
        :overlayOpacity="annotationOpacity"
        :createBlobSignal="createBlobSignal"
        @timeupdate="onFrameUpdate"
        @dragareastart="dragStartPosition = $event"
        @dragarea="draggingPosition = $event"
        @dragareaend="dragEndPosition = $event"
        @hover="hoverPosition = $event"
        @download="onDownload"
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
      <TextOverlay :labels="objectLabels"/>
    </VideoPlayer>

    <ImagePlayer
        v-if="isImagesSelected"
        :srcUrls="imageUrls"
        :seekFrame="seekFrame"
        :markerTimes="annotatedFrames"
        :overlayOpacity="annotationOpacity"
        @pageupdate="onFrameUpdate"
        @dragareastart="dragStartPosition = $event"
        @dragarea="draggingPosition = $event"
        @dragareaend="dragEndPosition = $event"
        @hover="hoverPosition = $event"
        @download="onDownload"
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
      <TextOverlay :labels="objectLabels"/>
    </ImagePlayer>

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
import {MovingPoint, MovingPointUtil, Point, PointUtil} from "@/common/interface/Point";
import FileUtil from "@/common/utils/FileUtil";
import AnnotationStatusBar from "@/components/UI/AnnotationStatusBar/AnnotationStatusBar.vue";
import FileDownloader from "@/common/utils/FileDownloader";
import ToolBar from "@/components/UI_Singleton/ToolBar/ToolBar.vue";
import DownloadButton from "@/components/UI/Button/DownloadButton.vue";
import VideoPlayer from "@/components/UI/Player/VideoPlayer.vue";
import TextOverlay from "@/components/Canvas/Overlay/TextOverlay.vue";
import BoundingBoxOverlay from "@/components/Canvas/Overlay/BoundingBoxOverlay.vue";
import {BoundingBoxModel} from "@/common/model/BoundingBoxModel";
import EditStateStore, {EditState} from "@/store/EditStateStore";
import OperationStore from "@/app/object_detection/store/OperationStore";
import AnnotationsStore, {Annotation} from "@/app/object_detection/store/AnnotationsStore";
import ClassListStore from "@/app/object_detection/store/ClassListStore";
import FileStore from "@/app/object_detection/store/FileStore";

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
  private annotationOpacity: number = 1;

  private dragStartPosition: MovingPoint = MovingPointUtil.zero();
  private draggingPosition: MovingPoint = MovingPointUtil.zero();
  private dragEndPosition: MovingPoint = MovingPointUtil.zero();
  private hoverPosition: Point = PointUtil.zero();

  private isDeleteMode: boolean = false;

  private frame: string = "";       // PlayerのフレームとOperationStoreのフレームの差分検知用
  private createBlobSignal: boolean = false;

  created() {
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


  get isVideoSelected() {
    return FileStore.isVideoFileSelected;
  }

  get isImagesSelected() {
    return FileStore.isImageFilesSelected;
  }

  get videoUrl() {
    return FileStore.videoUrl;
  }

  get imageUrls() {
    return FileStore.imageUrls;
  }

  get currentFileNameFull() {
    if (this.isVideoSelected)
      return FileStore.videoName;

    if (this.isImagesSelected){
      const imageIndex = parseInt(OperationStore.frame);
      return FileStore.imageNames[imageIndex];
    }

    return "";
  }

  get seekFrame(): number {
    return Number(this.frame == OperationStore.frame ? -1 : OperationStore.frame);
  }

  get annotatedFrames(): number[] {
    return Object.keys(AnnotationsStore.annotations)
        .map(v => Number(v))
        .sort((a, b) => a > b ? 1 : a < b ? -1 : 0);
  }

  get boundingBoxes(): { [objectId: string]: BoundingBoxModel } {
    let result = {} as any;
    const annotations = this.annotationsOfCurrentFrame;
    for (const objectId in annotations) {
      result[objectId] = annotations[objectId].bounding;
    }
    return result;
  }

  get annotationsOfCurrentFrame(): { [objectId: string]: Annotation } {
    return AnnotationsStore.annotations[OperationStore.frame] || {};
  }

  get operationOfCurrentFrame(): EditState {
    return EditStateStore.states[OperationStore.frame] || ({} as EditState);
  }

  get selectingObjectId() {
    return OperationStore.selectingObjectId;
  }

  get isUseAnnotationFile() {
    return this.operationOfCurrentFrame.isUseAnnotationFile;
  }

  get isDownloaded() {
    return this.operationOfCurrentFrame.isDownloaded && !this.operationOfCurrentFrame.isDirty;
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

  private onFrameUpdate(frame: number): void {
    this.frame = frame.toString();
    OperationStore.setFrame(this.frame);
  }

  private async restoreAnnotation() {
    AnnotationsStore.clear();

    for (let i = 0; i < FileStore.annotationFiles.length; i++) {
      const fileName = FileUtil.removeExtension(FileStore.annotationFiles[i].name);
      const fileNameParts = fileName.split("___");
      const frame = fileNameParts[fileNameParts.length - 2];

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

  private async onDownload() {
    if (this.isVideoSelected) {
      this.createBlobSignal = !this.createBlobSignal;
      return;
    }

    if (this.isImagesSelected) {
      const imageIndex = parseInt(OperationStore.frame);
      const file = FileStore.loadedFiles.imageFiles[imageIndex];
      FileDownloader.downloadBlob(file.name, file);
      this.downloadAnnotation(file.name);
      return;
    }
  }

  private onPrepareBlob(videoImageBlob: Blob) {
    const fileName = FileUtil.removeExtension(this.currentFileNameFull) + "___" + OperationStore.frame + "___";
    FileDownloader.downloadBlob(fileName + ".png", videoImageBlob);
    this.downloadAnnotation(fileName);
  }

  private downloadAnnotation(fileName: string) {
    const json = JSON.stringify(this.annotationsOfCurrentFrame);
    FileDownloader.downloadJsonFile(fileName + ".json", json);

    EditStateStore.setIsDownloaded({frame: OperationStore.frame, isDownloaded: true});
    EditStateStore.setIsDirty({frame: OperationStore.frame, isDirty: false});
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
