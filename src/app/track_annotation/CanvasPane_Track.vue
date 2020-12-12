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
          :isDeleteMode="isDeleteMode"
          :dragStartPosition="dragStartPosition"
          :draggingPosition="draggingPosition"
          :dragEndPosition="dragEndPosition"
          :hoverPosition="hoverPosition"
          :color="{r: 40, g: 80, b: 220, a: 1}"
          @resizestart="onBodyBoundingBoxChangeStart"
          @movestart="onBodyBoundingBoxChangeStart"
          @resize="onBodyBoundingBoxChange"
          @move="onBodyBoundingBoxChange"
          @resizeend="onBodyBoundingBoxChangeEnd"
          @moveend="onBodyBoundingBoxChangeEnd"
          @unselect="onBodyBoundingBoxUnselect"
          @delete="onBodyBoundingBoxDelete"
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

@Component({
  components: {
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
  private graphics: Graphic[] = [];

  private boundingColor: Color = {r: 40, g: 80, b: 220, a: 1};
  private jointColor: Color = {r: 0, g: 150, b: 40, a: 1};
  private jointRightLegColor: Color = {r: 150, g: 40, b: 0, a: 1};
  private boneColor: Color = {r: 0, g: 40, b: 150, a: 1};
  private neckMarkColor: Color = {r: 150, g: 80, b: 40, a: 1};

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

  // --- TextOverlay (behaviour and neck mark) ---------
  get objectLabels(): { text: string, position: Point, isActive: boolean }[] {
    let result = [];
    const annotations = this.currentAnnotations;
    for (const objectId in annotations) {
      const annotation = annotations[objectId];
      const behaviour = BEHAVIOUR[annotation.behaviour_class];
      const neckMark = annotation.neck_mark_bounding.left != -9999 ? NECK_MARK[annotation.neck_mark_class] : '';
      result.push({
        text: objectId + " : " + behaviour + " : " + neckMark,
        position: {
          x: annotation.bounding.left * 100,
          y: annotation.bounding.top * 100
        },
        isActive: objectId == this.selectingObjectId
      })
    }

    return result;
  }

  // --- TextOverlay (joint name) ---------
  get pointingJointLabel(): { text: string, position: Point, isActive: boolean }[] {
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
        x: (<any>targetJoint).x * 100,
        y: (<any>targetJoint).y * 100
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

  get selectingJoint() {
    const selectingObject = this.selectingObject;
    if (!selectingObject)
      return null;

    const jointName = OperationStore_Track.selectingJointName;
    return (<any>selectingObject.bone)[jointName];
  }

  created() {
    // // 表示対象のアノテーションたちの状態が変わった
    // this.$watch(
    //     () => this.currentAnnotations,
    //     () => this.draw(),
    //     {deep: true}
    // );
    //
    // // 選択対象やモードが変わった
    // this.$watch(
    //     () => OperationStore_Track.operation,
    //     () => this.draw(),
    //     {deep: true}
    // );

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

  private draw() {
    this.graphics = [];

    for (const objectId in this.currentAnnotations) {
      const annotation = this.currentAnnotations[objectId];
      const bone = annotation.bone;
      const isSelecting = this.selectingObjectId == objectId;

      // ------ bone  --------------------------------------------------
      this.boneColor.a = isSelecting && OperationStore_Track.isBoneMode ? 1 : 0.5;
      const boneLines = new MultiLines(
          [
            {start: bone.mouse, end: bone.head},
            {start: bone.head, end: bone.cervical_spine},
            {start: bone.cervical_spine, end: bone.left_shoulder},
            {start: bone.left_shoulder, end: bone.left_elbow},
            {start: bone.left_elbow, end: bone.left_wrist},
            {start: bone.left_wrist, end: bone.left_finger},
            {start: bone.cervical_spine, end: bone.right_shoulder},
            {start: bone.right_shoulder, end: bone.right_elbow},
            {start: bone.right_elbow, end: bone.right_wrist},
            {start: bone.right_wrist, end: bone.right_finger},
            {start: bone.cervical_spine, end: bone.pelvis},
            {start: bone.pelvis, end: bone.left_waist},
            {start: bone.left_waist, end: bone.left_knee},
            {start: bone.left_knee, end: bone.left_heel},
            {start: bone.left_heel, end: bone.left_toe},
            {start: bone.pelvis, end: bone.right_waist},
            {start: bone.right_waist, end: bone.right_knee},
            {start: bone.right_knee, end: bone.right_heel},
            {start: bone.right_heel, end: bone.right_toe},
          ].filter(v => v.start.x != -9999 && v.end.x != -9999),
          2,  // width
          this.boneColor
      );
      boneLines.zIndex = 1;
      this.graphics.push(boneLines);

      // ------ joint --------------------------------------------------
      this.jointColor.a = isSelecting && OperationStore_Track.isBoneMode ? 1 : 0.4;
      const joints = Object.entries(bone).filter((v) => v[0].indexOf("right") < 0);
      const jointPositions = joints.map(v => v[1]) as Point[];
      const boneJoints = new MultiCircles(jointPositions, 3, this.jointColor);
      boneJoints.zIndex = 2;
      this.graphics.push(boneJoints);

      // ------ joint right leg --------------------------------------------------
      this.jointRightLegColor.a = isSelecting && OperationStore_Track.isBoneMode ? 1 : 0.4;
      const jointsRightLeg = Object.entries(bone).filter((v) => v[0].indexOf("right") >= 0);
      const jointRightLegPositions = jointsRightLeg.map(v => v[1]) as Point[];
      const boneJointsRight = new MultiCircles(jointRightLegPositions, 3, this.jointRightLegColor);
      boneJointsRight.zIndex = 3;
      this.graphics.push(boneJointsRight);

      // ------ neck  --------------------------------------------------
      this.neckMarkColor.a = isSelecting && OperationStore_Track.isNeckMarkMode ? 1 : 0.5;
      const neckMarkBox = new RectangleLine(
          annotation.neck_mark_bounding.left,
          annotation.neck_mark_bounding.top,
          annotation.neck_mark_bounding.width,
          annotation.neck_mark_bounding.height,
          2,
          this.neckMarkColor
      );
      neckMarkBox.zIndex = 4;
      this.graphics.push(neckMarkBox);
    }
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
    const allFalse = {top: false, right: false, bottom: false, left: false};
    OperationStore_Track.setSelectingObjectId("");
    OperationStore_Track.setSelectingNeckMarkEdge(allFalse);
    OperationStore_Track.setSelectingJointName("");

    this.dragStartPosition = e;





    // バウンディングを探す
    const clickedBounding = this.searchBounding(e);



    // ボーンモード
    if (OperationStore_Track.isBoneMode) {
      const clickedJoint = this.searchJoint(e);
      if (this.isDeleteMode) {
        if (clickedJoint.objectId) {
          // 削除
          AnnotationsStore_Track.deleteJoint({
            frame: OperationStore_Track.frame,
            objectId: clickedJoint.objectId,
            jointName: clickedJoint.jointName
          });

          // 選択
          OperationStore_Track.setSelectingObjectId(clickedJoint.objectId);

          this.addHistory();
        }
      } else {
        // 選択
        const selectedObjectId = clickedJoint.objectId || clickedBounding.objectId;
        OperationStore_Track.setSelectingObjectId(selectedObjectId);
        OperationStore_Track.setSelectingJointName(clickedJoint.jointName);
      }
    }

    // 首装置モード
    if (OperationStore_Track.isNeckMarkMode) {
      const clickedNeckMark = this.searchNeckMark(e);
      if (this.isDeleteMode) {
        if (clickedNeckMark.objectId) {
          // 削除
          AnnotationsStore_Track.deleteNeckMark({
            frame: OperationStore_Track.frame,
            objectId: clickedNeckMark.objectId
          });

          // 選択
          OperationStore_Track.setSelectingObjectId(clickedNeckMark.objectId);

          this.addHistory();
        }
      } else {
        // 選択
        const selectedObjectId = clickedNeckMark.objectId || clickedBounding.objectId;
        OperationStore_Track.setSelectingObjectId(clickedBounding.objectId);
        OperationStore_Track.setSelectingNeckMarkEdge(clickedNeckMark.selectingEdge);
      }
    }
  }

  private onDrag(e: MovingPoint) {
    this.draggingPosition = e;

    // バウンディング選択

    // ボーン選択
    if (OperationStore_Track.isBoneMode) {
      if (this.selectingJoint) {
        AnnotationsStore_Track.setJointPosition({
          frame: OperationStore_Track.frame,
          objectId: this.selectingObjectId,
          jointName: OperationStore_Track.selectingJointName,
          position: e
        })
      }
    }

    // 首装置選択
    if (OperationStore_Track.isNeckMarkMode) {
      if (this.selectingObject) {
        const frame = OperationStore_Track.frame;
        const objectId = this.selectingObjectId;

        let bounding = DeepCloner.copy(this.selectingObject.neck_mark_bounding);
        if (bounding.left != -9999) {
          const isEdgeSelect = Object.values(OperationStore_Track.selectingNeckMarkEdge).filter(v => v).length >= 1;
          if (isEdgeSelect) {
            // 端のドラッグは矩形の拡大縮小
            if (OperationStore_Track.selectingNeckMarkEdge.left) {
              bounding.left += e.deltaX;
              bounding.width -= e.deltaX;
            }
            if (OperationStore_Track.selectingNeckMarkEdge.right) {
              bounding.width += e.deltaX;
            }
            if (OperationStore_Track.selectingNeckMarkEdge.top) {
              bounding.top += e.deltaY;
              bounding.height -= e.deltaY;
            }
            if (OperationStore_Track.selectingNeckMarkEdge.bottom) {
              bounding.height += e.deltaY;
            }
          } else {
            // 中心部ドラッグは移動
            bounding.top += e.deltaY;
            bounding.left += e.deltaX;
          }

          AnnotationsStore_Track.setNeckMarkBounding({
            frame: frame,
            objectId: objectId,
            neck_mark_bounding: bounding
          });
        }
      }
    }
  }

  private onDragEnd(e: MovingPoint) {
    this.dragEndPosition = e;

    if (this.selectingObject && !this.isDeleteMode) {
      this.addHistory();
    }
  }

  private onHover(e: Point) {
    this.hoverPosition = e;

    // ボーン
    if (OperationStore_Track.isBoneMode) {
      const hoveredJoint = this.searchJoint(e);
      OperationStore_Track.setHoveringObjectId(hoveredJoint.objectId);
      OperationStore_Track.setHoveringJointName(hoveredJoint.jointName);
    }
  }

  private searchBounding(position: Point) {
    let smallestArea = Number.MAX_VALUE;
    let smallestObjectId: string = "";
    let selectingEdge = {top: false, right: false, bottom: false, left: false};
    const edgeWidth = 0.02;

    for (const objectId in this.currentAnnotations) {
      const bounding = this.currentAnnotations[objectId].bounding;
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

  private searchNeckMark(position: Point) {
    let smallestArea = Number.MAX_VALUE;
    let smallestObjectId: string = "";
    let selectingEdge = {top: false, right: false, bottom: false, left: false};
    const edgeWidth = 0.02;

    for (const objectId in this.currentAnnotations) {
      const bounding = this.currentAnnotations[objectId].neck_mark_bounding;
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

  private searchJoint(position: Point) {
    let nearestDistance = Number.MAX_VALUE;
    let nearestJoint: { objectId: string, jointName: string } = {objectId: "", jointName: ""};

    for (const objectId in this.currentAnnotations) {
      for (const jointName in this.currentAnnotations[objectId].bone) {
        const bonePosition = (<any>this.currentAnnotations[objectId].bone)[jointName];
        const distance = PointUtil.distance(bonePosition, position);
        if (distance < 0.05 && distance < nearestDistance) {
          nearestDistance = distance;
          nearestJoint = {objectId: objectId, jointName: jointName};
        }
      }
    }

    return nearestJoint;
  }

  private onBodyBoundingBoxChangeStart(objectId: string) {
    OperationStore_Track.setSelectingObjectId(objectId);
  }

  private onBodyBoundingBoxChange(objectId: string, bounding: BoundingBoxModel) {
    const frame = OperationStore_Track.frame;
    AnnotationsStore_Track.setBounding({
      frame: frame,
      objectId: objectId,
      bounding: bounding
    });
  }

  private onBodyBoundingBoxChangeEnd(objectId: string) {
    this.addHistory();
  }

  private onBodyBoundingBoxUnselect() {
    OperationStore_Track.setSelectingObjectId("");
  }

  private onBodyBoundingBoxDelete(objectId: string) {
    const frame = OperationStore_Track.frame;
    AnnotationsStore_Track.deleteObject({
      frame: frame,
      objectId: objectId,
    });
  }

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
