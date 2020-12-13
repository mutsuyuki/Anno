<template>
  <div v-show="isShow">
    <ToolBar/>

    <AnnotationStatusBar
        class="annotation-status-bar"
        :fileName="videoFileName"
        :isUseAnnotationFile="isUseAnnotationFile"
        :isDownloaded="isDownloaded"
    />

    <VideoPlayer
        :seekFrame="seekFrame"
        :createBlobSignal="createBlobSignal"
        :markerTimes="[]"
        :overlayOpacity="opacity"
        @dragareastart="onDragStart"
        @dragarea="onDrag"
        @dragareaend="onDragEnd"
        @hover="onHover"
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
import ImagePlayer from "@/components/UI_Singleton/Player/ImagePlayer.vue";
import CanvasRenderer from "@/components/Canvas/Renderer/CanvasRenderer.vue";
import {Graphic} from "@/components/Canvas/Renderer/Graphic";
import {MovingPoint, MovingPointUtil, Point, PointUtil} from "@/common/interface/Point";
import {Color} from "@/common/interface/Color";
import FileUtil from "@/common/utils/FileUtil";
import AnnotationStatusBar from "@/components/AnnotationStatusBar.vue";
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import FileDownloader from "@/common/utils/FileDownloader";
import ToolBar from "@/components/UI_Singleton/ToolBar/ToolBar.vue";
import DownloadButton from "@/components/UI/Button/DownloadButton.vue";
import VideoPlayerStore from "@/components/UI_Singleton/Player/VideoPlayerStore";
import VideoPlayer from "@/components/UI_Singleton/Player/VideoPlayer.vue";
import OperationStore_Track from "@/app/track_annotation/store/OperationStore_Track";
import AnnotationsStore_Track, {Annotation_Track} from "@/app/track_annotation/store/AnnotationsStore_Track";
import MultiLines from "@/components/Canvas/Renderer/MultiLines";
import MultiCircles from "@/components/Canvas/Renderer/MultiCircles";
import RectangleLine from "@/components/Canvas/Renderer/RectangleLine";
import DeepCloner from "@/common/utils/DeepCloner";
import TextOverlay from "@/components/Canvas/Overlay/TextOverlay.vue";
import EditSequencesStore, {EditSequence} from "@/store/EditSequenceStore";
import CanvasSettingsStore from "@/components/UI_Singleton/ToolBar/CanvasSettingsStore";
import ScrollableArea from "@/components/UI/ScrollableArea.vue";
import {BEHAVIOUR, NECK_MARK} from "@/app/track_annotation/const/TrackConst";
import BoundingBoxOverlay from "@/components/Canvas/Overlay/BoundingBoxOverlay.vue";
import {BoundingBoxModel} from "@/common/model/BoundingBoxModel";
import AnimalBoneOverlay from "@/components/Canvas/Overlay/AnimalBoneOverlay.vue";
import {AnimalBoneModel} from "@/common/model/AnimalBoneModel";

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
export default class CanvasPane_Track extends Vue {
  private createBlobSignal: boolean = false;
  private isDeleteMode: boolean = false;

  private dragStartPosition: MovingPoint = MovingPointUtil.zero();
  private draggingPosition: MovingPoint = MovingPointUtil.zero();
  private dragEndPosition: MovingPoint = MovingPointUtil.zero();
  private hoverPosition: Point = PointUtil.zero();

  private frame: string = "";       // ビデオのフレームと、OperationStore上の現在フレームに差分検知用

  // --- container ---------
  get isShow() {
    return VideoPlayerStore.isSelected;
  }

  // --- AnnotationStatusBar ---------
  get videoFileName() {
    return VideoPlayerStore.name;
  }

  get currentEditSequence(): EditSequence {
    return EditSequencesStore.sequences[OperationStore_Track.frame] || ({} as EditSequence);
  }

  get isUseAnnotationFile() {
    return this.currentEditSequence.isUseAnnotationFile;
  }

  get isDownloaded() {
    return this.currentEditSequence.isDownloaded && !this.currentEditSequence.isDirty;
  }

  // --- VideoPlayer ---------
  get seekFrame(): number {
    return Number(this.frame == OperationStore_Track.frame ? -1 : OperationStore_Track.frame);
  }

  get opacity() {
    return CanvasSettingsStore.opacity;
  }

  // --- BondingBoxOverlay (body) ---------
  get bodyBoundingBoxes(): { [objectId: string]: BoundingBoxModel } {
    let result = {} as any;
    const annotations = this.currentAnnotations;
    for (const objectId in annotations) {
      result[objectId] = annotations[objectId].bounding;
    }
    return result;
  }

  get bodyOpacity() {
    return OperationStore_Track.isBoundingMode ? 1 : 0.5;
  }

  // --- AnimalBoneOverlay ---------------------
  get useBoneInteraction() {
    return OperationStore_Track.isBoneMode;
  }

  get animalBones(): { [objectId: string]: AnimalBoneModel } {
    let result = {} as any;
    const annotations = this.currentAnnotations;
    for (const objectId in annotations) {
      result[objectId] = annotations[objectId].bone;
    }
    return result;
  }

  get boneOpacity() {
    return OperationStore_Track.isBoneMode ? 1 : 0.5;
  }

  // --- BondingBoxOverlay (neck mark) ---------
  get useNeckMarkInteraction() {
    return OperationStore_Track.isNeckMarkMode;
  }

  get neckMarkBoundingBoxes(): { [objectId: string]: BoundingBoxModel } {
    let result = {} as any;
    const annotations = this.currentAnnotations;
    for (const objectId in annotations) {
      if (annotations[objectId].neck_mark_bounding.left != -9999) {
        result[objectId] = annotations[objectId].neck_mark_bounding;
      }
    }
    return result;
  }

  get neckMarkOpacity() {
    return OperationStore_Track.isNeckMarkMode ? 1 : 0.5;
  }

  // --- TextOverlay (behaviour and neck mark) ---------
  get objectLabels(): { text: string, position: { x: string, y: string }, isActive: boolean }[] {
    let result = [];
    const annotations = this.currentAnnotations;
    for (const objectId in annotations) {
      const annotation = annotations[objectId];
      const behaviour = BEHAVIOUR[annotation.behaviour_class];
      const neckMark = annotation.neck_mark_bounding.left != -9999 ? NECK_MARK[annotation.neck_mark_class] : '';
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
    const hoveringObjectId = OperationStore_Track.hoveringObjectId;
    const targetAnnotation = this.currentAnnotations[hoveringObjectId];
    if (!targetAnnotation) {
      return [];
    }

    const hoveringJointName = OperationStore_Track.hoveringJointName;
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
  get currentAnnotations(): { [objectId: string]: Annotation_Track } {
    return AnnotationsStore_Track.annotations[OperationStore_Track.frame] || {};
  }

  get selectingObjectId() {
    return OperationStore_Track.selectingObjectId;
  }

  get selectingObject() {
    const frame = OperationStore_Track.frame;
    if (!AnnotationsStore_Track.annotations[frame])
      return null;

    const objectId = this.selectingObjectId;
    return AnnotationsStore_Track.annotations[frame][objectId];
  }

  get selectingJointName() {
    return OperationStore_Track.selectingJointName;
  }

  created() {
    // フレームが変わった
    this.$watch(
        () => OperationStore_Track.frame,
        () => EditSequencesStore.createIfNothing(OperationStore_Track.frame),
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
    AnnotationsStore_Track.clear();

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

      AnnotationsStore_Track.setAnnotationsOfFrame({
        frame: frame,
        data: JSON.parse(fileText as string)
      });

      EditSequencesStore.setIsUseAnnotationFile({
        frame: frame,
        isUseAnnotationFile: true
      });
    }

    this.addHistory();
  }

  private onDragStart(e: MovingPoint) {
    // すべての選択状態を一旦解除
    OperationStore_Track.setSelectingObjectId("");
    OperationStore_Track.setSelectingJointName("");

    this.dragStartPosition = e;
  }

  private onDrag(e: MovingPoint) {
    this.draggingPosition = e;
  }

  private onDragEnd(e: MovingPoint) {
    this.dragEndPosition = e;

    if (this.selectingObject && !this.isDeleteMode) {
      this.addHistory();
    }
  }

  private onHover(e: Point) {
    this.hoverPosition = e;
  }

  // --- body bounding box overlay callback ------------------------------------------
  private onChangeStartBodyBoundingBox(objectId: string) {
    // bodyの矩形を押下した場合モード関係なく選択状態にする
    OperationStore_Track.setSelectingObjectId(objectId);
  }

  private onMoveBodyBoundingBox(objectId: string, bounding: BoundingBoxModel) {
    if (OperationStore_Track.isBoundingMode) {
      const frame = OperationStore_Track.frame;
      AnnotationsStore_Track.setBounding({
        frame: frame,
        objectId: objectId,
        bounding: bounding
      });

      AnnotationsStore_Track.moveJointPositions({
        frame: frame,
        objectId: objectId,
        moveAmount: {x: this.draggingPosition.deltaX, y: this.draggingPosition.deltaY}
      })

      AnnotationsStore_Track.moveNeckMarkBounding({
        frame: frame,
        objectId: objectId,
        moveAmount: {x: this.draggingPosition.deltaX, y: this.draggingPosition.deltaY}
      })
    }
  }


  private onResizeBodyBoundingBox(objectId: string, bounding: BoundingBoxModel) {
    if (OperationStore_Track.isBoundingMode) {
      const frame = OperationStore_Track.frame;
      AnnotationsStore_Track.setBounding({
        frame: frame,
        objectId: objectId,
        bounding: bounding
      });
    }
  }

  private onChangeEndBodyBoundingBox(objectId: string) {
    if (OperationStore_Track.isBoundingMode) {
      this.addHistory();
    }
  }

  private onUnselectBodyBoundingBox() {
    if (OperationStore_Track.isBoundingMode) {
      OperationStore_Track.setSelectingObjectId("");
    }
  }

  private onDeleteBodyBoundingBox(objectId: string) {
    if (OperationStore_Track.isBoundingMode) {
      const frame = OperationStore_Track.frame;
      AnnotationsStore_Track.deleteObject({
        frame: frame,
        objectId: objectId,
      });
    }
  }

  // --- bone overlay callback ------------------------------------------
  private onChangeStartBone(objectId: string, jointName: string) {
    if (OperationStore_Track.isBoneMode) {
      OperationStore_Track.setSelectingObjectId(objectId);
      OperationStore_Track.setSelectingJointName(jointName);
    }
  }

  private onChangeBone(objectId: string, jointName: string, position: Point) {
    if (OperationStore_Track.isBoneMode) {
      const frame = OperationStore_Track.frame;
      AnnotationsStore_Track.setJointPosition({
        frame: frame,
        objectId: objectId,
        jointName: jointName,
        position: position
      });
    }
  }

  private onChangeEndBone(objectId: string, jointName: string) {
    if (OperationStore_Track.isBoneMode) {
      this.$nextTick(() => this.addHistory());
    }
  }

  private onUnselectBone() {
    // 選択はbodyのboundingで判定するので、何もしない
  }

  private onDeleteBone(objectId: string, jointName: string) {
    if (OperationStore_Track.isBoneMode) {
      const frame = OperationStore_Track.frame;
      AnnotationsStore_Track.deleteJoint({
        frame: frame,
        objectId: objectId,
        jointName: jointName
      });
      this.$nextTick(() => this.addHistory());
    }
  }

  private onHoverBone(objectId: string, jointName: string) {
    OperationStore_Track.setHoveringObjectId(objectId);
    OperationStore_Track.setHoveringJointName(jointName);
  }

  // --- neck mark overlay callback ------------------------------------------
  private onChangeStartNeckMarkBoundingBox(objectId: string) {
    if (OperationStore_Track.isNeckMarkMode) {
      OperationStore_Track.setSelectingObjectId(objectId)
    }
  }

  private onChangeNeckMarkBoundingBox(objectId: string, bounding: BoundingBoxModel) {
    if (OperationStore_Track.isNeckMarkMode) {
      const frame = OperationStore_Track.frame;
      AnnotationsStore_Track.setNeckMarkBounding({
        frame: frame,
        objectId: objectId,
        neck_mark_bounding: bounding
      });
    }
  }

  private onChangeEndNeckMarkBoundingBox(objectId: string) {
    if (OperationStore_Track.isNeckMarkMode) {
      this.$nextTick(() => this.addHistory());
    }
  }

  private onUnselectNeckMarkBoundingBox() {
    // 選択はbodyのboundingで判定するので、何もしない
  }

  private onDeleteNeckMarkBoundingBox(objectId: string) {
    if (OperationStore_Track.isNeckMarkMode) {
      const frame = OperationStore_Track.frame;
      AnnotationsStore_Track.deleteNeckMark({
        frame: frame,
        objectId: objectId,
      });
      this.$nextTick(() => this.addHistory());
    }
  }

  // ------------------------------------------------------------------------------------

  private addHistory() {
    this.$emit("addHistory")
  }

  private onTimeUpdate(frame: number): void {
    this.frame = frame.toString();
    OperationStore_Track.setFrame(this.frame);
  }

  private async onDownload() {
    this.createBlobSignal = !this.createBlobSignal;
  }

  private onPrepareBlob(videoImageBlob: Blob) {
    const fileName = FileUtil.removeExtension(this.videoFileName) + "___" + OperationStore_Track.frame + "___";
    FileDownloader.downloadBlob(fileName + ".png", videoImageBlob);

    const json = JSON.stringify(this.currentAnnotations);
    FileDownloader.downloadJsonFile(fileName + ".json", json);

    EditSequencesStore.setIsDownloaded({frame: OperationStore_Track.frame, isDownloaded: true});
    EditSequencesStore.setIsDirty({frame: OperationStore_Track.frame, isDirty: false});
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
