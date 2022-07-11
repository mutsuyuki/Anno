<template>
  <div v-show="isShow">
    <ToolBar
        :annotationOpacity="annotationOpacity"
        @annotationOpacity="annotationOpacity = $event"
    />

    <AnnotationStatusBar
        class="annotation-status-bar"
        :fileName="videoFileName"
        :isUseAnnotationFile="isUseAnnotationFile"
        :isDownloaded="isDownloaded"
    />

    <VideoPlayer
        :srcUrl="videoUrl"
        :seekFrame="seekFrame"
        :markerTimes="annotatedFrames"
        :overlayOpacity="annotationOpacity"
        :createBlobSignal="createBlobSignal"
        @dragareastart="dragStartPosition = $event"
        @dragarea="draggingPosition = $event"
        @dragareaend="dragEndPosition = $event"
        @hover="hoverPosition = $event"
        @download="onDownload"
        @timeupdate="onTimeUpdate"
        @prepareBlob="onPrepareBlob"
    >
      <BoundingBoxOverlay
          :boundingBoxModels="bodyBoundingBoxes"
          :selectingObjectId="selectingObjectId"
          :useInteraction="true"
          :isDeleteMode="isDeleteMode"
          :dragStartPosition="dragStartPosition"
          :draggingPosition="draggingPosition"
          :dragEndPosition="dragEndPosition"
          :hoverPosition="hoverPosition"
          :color="{r: 40, g: 80, b: 220, a: bodyOpacity}"
          @resizestart="onChangeStartBodyBoundingBox"
          @movestart="onChangeStartBodyBoundingBox"
          @resize="onResizeBodyBoundingBox"
          @move="onMoveBodyBoundingBox"
          @resizeend="onChangeEndBodyBoundingBox"
          @moveend="onChangeEndBodyBoundingBox"
          @unselect="onUnselectBodyBoundingBox"
          @delete="onDeleteBodyBoundingBox"
      />

      <AnimalBoneOverlay
          :animalBoneModels="animalBones"
          :selectingObjectId="selectingObjectId"
          :selectingJointName="selectingJointName"
          :useInteraction="useBoneInteraction"
          :isDeleteMode="isDeleteMode"
          :dragStartPosition="dragStartPosition"
          :draggingPosition="draggingPosition"
          :dragEndPosition="dragEndPosition"
          :hoverPosition="hoverPosition"
          :boneColor="{r: 0, g: 40, b: 150, a: boneOpacity}"
          :jointColor="{r: 0, g: 150, b: 40, a: boneOpacity}"
          :jointRightLegColor="{r: 150, g: 40, b: 0, a: boneOpacity}"
          @resizestart="onChangeStartBone"
          @movestart="onChangeStartBone"
          @resize="onChangeBone"
          @move="onChangeBone"
          @resizeend="onChangeEndBone"
          @moveend="onChangeEndBone"
          @hover="onHoverBone"
          @unselect="onUnselectBone"
          @delete="onDeleteBone"
      />

      <BoundingBoxOverlay
          :boundingBoxModels="neckMarkBoundingBoxes"
          :selectingObjectId="selectingObjectId"
          :useInteraction="useNeckMarkInteraction"
          :isDeleteMode="isDeleteMode"
          :dragStartPosition="dragStartPosition"
          :draggingPosition="draggingPosition"
          :dragEndPosition="dragEndPosition"
          :hoverPosition="hoverPosition"
          :color="{r: 150, g: 80, b: 40, a: neckMarkOpacity}"
          @resizestart="onChangeStartNeckMarkBoundingBox"
          @movestart="onChangeStartNeckMarkBoundingBox"
          @resize="onChangeNeckMarkBoundingBox"
          @move="onChangeNeckMarkBoundingBox"
          @resizeend="onChangeEndNeckMarkBoundingBox"
          @moveend="onChangeEndNeckMarkBoundingBox"
          @unselect="onUnselectNeckMarkBoundingBox"
          @delete="onDeleteNeckMarkBoundingBox"
      />

      <!--      <CanvasRenderer :graphics="graphics"/>-->
      <TextOverlay :labels="objectLabels"/>
      <TextOverlay :labels="pointingJointLabel"/>

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
import {MovingPoint, MovingPointUtil, Point, PointUtil} from "@/common/interface/Point";
import FileUtil from "@/common/utils/FileUtil";
import FileDownloader from "@/common/utils/FileDownloader";
import ToolBar from "@/components/UI_Singleton/ToolBar/ToolBar.vue";
import DownloadButton from "@/components/UI/Button/DownloadButton.vue";
import VideoPlayer from "@/components/UI/Player/VideoPlayer.vue";
import ScrollableArea from "@/components/UI/Area/ScrollableArea.vue";
import AnnotationStatusBar from "@/components/UI/AnnotationStatusBar/AnnotationStatusBar.vue";
import TextOverlay from "@/components/Canvas/Overlay/TextOverlay.vue";
import BoundingBoxOverlay from "@/components/Canvas/Overlay/BoundingBoxOverlay.vue";
import AnimalBoneOverlay from "@/components/Canvas/Overlay/AnimalBoneOverlay.vue";
import {BoundingBoxModel} from "@/common/model/BoundingBoxModel";
import {AnimalBoneModel} from "@/common/model/AnimalBoneModel";
import OperationStore from "@/app/pose_tracking/store/OperationStore";
import AnnotationsStore, {Annotation} from "@/app/pose_tracking/store/AnnotationsStore";
import EditStateStore, {EditState} from "@/store/EditStateStore";
import FileStore from "@/app/pose_tracking/store/FileStore";
import ClassListStore from "@/app/pose_tracking/store/ClassListStore";

@Component({
  components: {
    AnimalBoneOverlay,
    BoundingBoxOverlay,
    TextOverlay,
    ScrollableArea,
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

  private frame: string = "";       // ビデオのフレームと、OperationStore上の現在フレームに差分検知用
  private createBlobSignal: boolean = false;  // VideoPlayerに画像のBlobを作成依頼するトリガー用

  // --- container ---------
  get isShow() {
    return FileStore.isVideoFileSelected;
  }

  // --- AnnotationStatusBar ---------
  get videoFileName() {
    return FileStore.videoName;
  }

  get currentEditSequence(): EditState {
    return EditStateStore.states[OperationStore.frame] || ({} as EditState);
  }

  get isUseAnnotationFile() {
    return this.currentEditSequence.isUseAnnotationFile;
  }

  get isDownloaded() {
    return this.currentEditSequence.isDownloaded && !this.currentEditSequence.isDirty;
  }

  // --- VideoPlayer ---------
  get videoUrl() {
    return FileStore.videoUrl;
  }

  get seekFrame(): number {
    return Number(this.frame == OperationStore.frame ? -1 : OperationStore.frame);
  }

  get annotatedFrames(): number[] {
    return Object.keys(AnnotationsStore.annotations)
        .map(v => Number(v))
        .sort((a, b) => a > b ? 1 : a < b ? -1 : 0);
  }

  // --- BondingBoxOverlay (body) ---------
  get bodyBoundingBoxes(): { [objectId: string]: BoundingBoxModel } {
    let result = {} as any;
    const annotations = this.annotationsOfCurrentFrame;
    for (const objectId in annotations) {
      result[objectId] = annotations[objectId].bounding;
    }
    return result;
  }

  get bodyOpacity() {
    return OperationStore.isBoundingMode ? 1 : 0.7;
  }

  // --- AnimalBoneOverlay ---------------------
  get useBoneInteraction() {
    return OperationStore.isBoneMode;
  }

  get animalBones(): { [objectId: string]: AnimalBoneModel } {
    let result = {} as any;
    const annotations = this.annotationsOfCurrentFrame;
    for (const objectId in annotations) {
      result[objectId] = annotations[objectId].bone;
    }
    return result;
  }

  get boneOpacity() {
    return OperationStore.isBoneMode ? 1 : 0.7;
  }

  // --- BondingBoxOverlay (neck mark) ---------
  get useNeckMarkInteraction() {
    return OperationStore.isNeckMarkMode;
  }

  get neckMarkBoundingBoxes(): { [objectId: string]: BoundingBoxModel } {
    let result = {} as any;
    const annotations = this.annotationsOfCurrentFrame;
    for (const objectId in annotations) {
      if (annotations[objectId].neck_mark_bounding.left != -9999) {
        result[objectId] = annotations[objectId].neck_mark_bounding;
      }
    }
    return result;
  }

  get neckMarkOpacity() {
    return OperationStore.isNeckMarkMode ? 1 : 0.7;
  }

  // --- TextOverlay (behaviour and neck mark) ---------
  get objectLabels(): { text: string, position: { x: string, y: string }, isActive: boolean }[] {
    let result = [];
    const annotations = this.annotationsOfCurrentFrame;
    for (const objectId in annotations) {
      const annotation = annotations[objectId];
      const behaviour = ClassListStore.behaviours[annotation.behaviour_class];
      const neckMark = annotation.neck_mark_bounding.left != -9999 ? ClassListStore.neckMarks[annotation.neck_mark_class] : '';
      result.push({
        text: objectId + " : " + behaviour + " : " + neckMark,
        position: {
          x: (annotation.bounding.left * 100) + "%",
          y: (annotation.bounding.top * 100) + "%"
        },
        isActive: objectId == this.selectingObjectId
      })
    }

    return result;
  }

  // --- TextOverlay (joint name) ---------
  get pointingJointLabel(): { text: string, position: { x: string, y: string }, isActive: boolean }[] {
    const hoveringObjectId = OperationStore.hoveringObjectId;
    const targetAnnotation = this.annotationsOfCurrentFrame[hoveringObjectId];
    if (!targetAnnotation) {
      return [];
    }

    const hoveringJointName = OperationStore.hoveringJointName;
    const targetJoint = (<any>targetAnnotation).bone[hoveringJointName];
    if (!targetJoint) {
      return [];
    }

    return [{
      text: hoveringJointName,
      position: {
        x: ((<any>targetJoint).x * 100) + "%",
        y: ((<any>targetJoint).y * 100) + "%"
      },
      isActive: true
    }]
  }

  // --- Common getter ---------
  get annotationsOfCurrentFrame(): { [objectId: string]: Annotation } {
    return AnnotationsStore.annotations[OperationStore.frame] || {};
  }

  get selectingObjectId() {
    return OperationStore.selectingObjectId;
  }

  get selectingJointName() {
    return OperationStore.selectingJointName;
  }

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

    this.addHistory();
  }

  // --- body bounding box overlay callback ------------------------------------------
  private onChangeStartBodyBoundingBox(objectId: string) {
    // bodyの矩形を押下した場合モード関係なく選択状態にする
    OperationStore.setSelectingObjectId(objectId);
  }

  private onMoveBodyBoundingBox(objectId: string, bounding: BoundingBoxModel) {
    if (OperationStore.isBoundingMode) {
      const frame = OperationStore.frame;
      AnnotationsStore.setBounding({
        frame: frame,
        objectId: objectId,
        bounding: bounding
      });

      AnnotationsStore.moveJointPositions({
        frame: frame,
        objectId: objectId,
        moveAmount: {x: this.draggingPosition.deltaX, y: this.draggingPosition.deltaY}
      })

      AnnotationsStore.moveNeckMarkBounding({
        frame: frame,
        objectId: objectId,
        moveAmount: {x: this.draggingPosition.deltaX, y: this.draggingPosition.deltaY}
      })
    }
  }


  private onResizeBodyBoundingBox(objectId: string, bounding: BoundingBoxModel) {
    if (OperationStore.isBoundingMode) {
      const frame = OperationStore.frame;
      AnnotationsStore.setBounding({
        frame: frame,
        objectId: objectId,
        bounding: bounding
      });
    }
  }

  private onChangeEndBodyBoundingBox(objectId: string) {
    if (OperationStore.isBoundingMode) {
      this.addHistory();
    }
  }

  private onUnselectBodyBoundingBox() {
    if (OperationStore.isBoundingMode) {
      OperationStore.setSelectingObjectId("");
    }
  }

  private onDeleteBodyBoundingBox(objectId: string) {
    if (OperationStore.isBoundingMode) {
      const frame = OperationStore.frame;
      AnnotationsStore.deleteObject({
        frame: frame,
        objectId: objectId,
      });

      this.addHistory();
    }
  }

  // --- bone overlay callback ------------------------------------------
  private onChangeStartBone(objectId: string, jointName: string) {
    if (OperationStore.isBoneMode) {
      OperationStore.setSelectingObjectId(objectId);
      OperationStore.setSelectingJointName(jointName);
    }
  }

  private onChangeBone(objectId: string, jointName: string, position: Point) {
    if (OperationStore.isBoneMode) {
      const frame = OperationStore.frame;
      AnnotationsStore.setJointPosition({
        frame: frame,
        objectId: objectId,
        jointName: jointName,
        position: position
      });
    }
  }

  private onChangeEndBone(objectId: string, jointName: string) {
    if (OperationStore.isBoneMode) {
      this.addHistory();
    }
  }

  private onUnselectBone() {
    // 選択はbodyのboundingで判定するので、何もしない
  }

  private onDeleteBone(objectId: string, jointName: string) {
    if (OperationStore.isBoneMode) {
      const frame = OperationStore.frame;
      AnnotationsStore.deleteJoint({
        frame: frame,
        objectId: objectId,
        jointName: jointName
      });
      this.addHistory();
    }
  }

  private onHoverBone(objectId: string, jointName: string) {
    OperationStore.setHoveringObjectId(objectId);
    OperationStore.setHoveringJointName(jointName);
  }

  // --- neck mark overlay callback ------------------------------------------
  private onChangeStartNeckMarkBoundingBox(objectId: string) {
    if (OperationStore.isNeckMarkMode) {
      OperationStore.setSelectingObjectId(objectId)
    }
  }

  private onChangeNeckMarkBoundingBox(objectId: string, bounding: BoundingBoxModel) {
    if (OperationStore.isNeckMarkMode) {
      const frame = OperationStore.frame;
      AnnotationsStore.setNeckMarkBounding({
        frame: frame,
        objectId: objectId,
        neck_mark_bounding: bounding
      });
    }
  }

  private onChangeEndNeckMarkBoundingBox(objectId: string) {
    if (OperationStore.isNeckMarkMode) {
      this.addHistory();
    }
  }

  private onUnselectNeckMarkBoundingBox() {
    // 選択はbodyのboundingで判定するので、何もしない
  }

  private onDeleteNeckMarkBoundingBox(objectId: string) {
    if (OperationStore.isNeckMarkMode) {
      const frame = OperationStore.frame;
      AnnotationsStore.deleteNeckMark({
        frame: frame,
        objectId: objectId,
      });
      this.addHistory();
    }
  }

  // ------------------------------------------------------------------------------------

  private addHistory() {
    this.$emit("addHistory")
  }

  private onTimeUpdate(frame: number): void {
    this.frame = frame.toString();
    OperationStore.setFrame(this.frame);
  }

  private async onDownload() {
    this.createBlobSignal = !this.createBlobSignal;
  }

  private onPrepareBlob(videoImageBlob: Blob) {
    const fileName = FileUtil.removeExtension(this.videoFileName) + "___" + OperationStore.frame + "___";
    FileDownloader.downloadBlob(fileName + ".png", videoImageBlob);

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
