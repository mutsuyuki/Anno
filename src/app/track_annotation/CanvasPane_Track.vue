<template>
  <div class="canvas-pane"
       v-show="isVideoSelected"
  >
    <ToolBar/>

    <AnnotationStatusBar
        class="annotation-status-bar"
        :fileName="currentFileNameFull"
        :isUseAnnotationFile="isUseAnnotationFile"
        :isDownloaded="isDownloaded"
    />

    <VideoPlayer
        :frameForSeek="frameForSeek"
        :createBlobSignal="createBlobSignal"
        :markerTimes="[]"
        @dragareastart="onDragStart"
        @dragarea="onDrag"
        @dragareaend="onDragEnd"
        @hover="onHover"
        @download="onDownload"
        @timeupdate="onTimeUpdate"
        @prepareBlob="onPrepareBlob"
    >
      <CanvasRenderer class="canvas_renderer" :graphics="graphics" :opacity="opacity"/>
      <MultiLabels :labels="objectLabels" :opacity="opacity"/>
      <MultiLabels :labels="pointingJointLabel" :opacity="opacity"/>
    </VideoPlayer>

    <DownloadButton
        class="download-button"
        @download="onDownload"
    />

  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import ImagePlayer from "@/components/Player/ImagePlayer.vue";
import CanvasRenderer from "@/components/Canvas/CanvasRenderer.vue";
import {Graphic} from "@/components/Canvas/Graphic";
import {MovingPoint, Point, PointUtil} from "@/common/interface/Point";
import {Color} from "@/common/interface/Color";
import FileUtil from "@/common/utils/FileUtil";
import AnnotationStatusBar from "@/components/AnnotationStatusBar.vue";
import AnnotationFilesStore from "@/store/AnnotationFilesStore";
import FileDownloader from "@/common/utils/FileDownloader";
import ToolBar from "@/components/ToolBar.vue";
import DownloadButton from "@/components/DownloadButton.vue";
import VideoFileStore from "@/store/VideoFileStore";
import VideoPlayer from "@/components/Player/VideoPlayer.vue";
import OperationStore_Track from "@/app/track_annotation/store/OperationStore_Track";
import AnnotationsStore_Track, {Annotation_Track} from "@/app/track_annotation/store/AnnotationsStore_Track";
import MultiLines from "@/components/Canvas/MultiLines";
import MultiCircles from "@/components/Canvas/MultiCircles";
import RectangleLine from "@/components/Canvas/RectangleLine";
import DeepCloner from "@/common/utils/DeepCloner";
import MultiLabels from "@/components/CanvasOverlay/MultiLabels.vue";
import OperationOfFramesStore, {OperationOfFrame} from "@/store/OperationOfFramesStore";
import CanvasSettingsStore from "@/store/CanvasSettingsStore";
import ScrollableArea from "@/components/Layout/ScrollableArea.vue";

@Component({
  components: {
    ScrollableArea,
    MultiLabels,
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

  private circleActiveColor: Color = {r: 0, g: 150, b: 40, a: 1};
  private circleInactiveColor: Color = {r: 0, g: 150, b: 40, a: 0.5};
  private circleActiveRightColor: Color = {r: 150, g: 40, b: 0, a: 1};
  private circleInactiveRightColor: Color = {r: 150, g: 40, b: 0, a: 0.5};
  private lineActiveColor: Color = {r: 0, g: 40, b: 150, a: 1};
  private lineInactiveColor: Color = {r: 0, g: 40, b: 150, a: 0.5};

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
    return Number(this.frame == OperationStore_Track.frame ? -1 : OperationStore_Track.frame);
  }

  get operationOfCurrentFrame(): OperationOfFrame {
    return OperationOfFramesStore.operations[OperationStore_Track.frame] || ({} as OperationOfFrame);
  }

  get isUseAnnotationFile() {
    return this.operationOfCurrentFrame.isUseAnnotationFile;
  }

  get isDownloaded() {
    return this.operationOfCurrentFrame.isDownloaded && !this.operationOfCurrentFrame.isDirty;
  }

  get annotationsOfCurrentFrame(): { [objectId: string]: Annotation_Track } {
    return AnnotationsStore_Track.annotations[OperationStore_Track.frame] || {};
  }

  get opacity() {
    return CanvasSettingsStore.opacity;
  }

  get objectLabels(): { text: string, position: Point, isActive: boolean }[] {
    let result = [];
    const annotations = this.annotationsOfCurrentFrame;
    for (const objectId in annotations) {
      result.push({
        text: "ID : " + objectId,
        position: {
          x: annotations[objectId].bounding.left * 100,
          y: annotations[objectId].bounding.top * 100
        },
        isActive: objectId == OperationStore_Track.selectingObjectId
      })
    }

    return result;
  }

  get pointingJointLabel(): { text: string, position: Point, isActive: boolean }[] {
    const hoveringObjectId = OperationStore_Track.hoveringObjectId;
    const targetAnnotation = this.annotationsOfCurrentFrame[hoveringObjectId];
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

  get selectingObject() {
    const frame = OperationStore_Track.frame;
    if (!AnnotationsStore_Track.annotations[frame])
      return null;

    const objectId = OperationStore_Track.selectingObjectId;
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
    // 表示対象のアノテーションたちの状態が変わった
    this.$watch(
        () => this.annotationsOfCurrentFrame,
        () => this.draw(),
        {deep: true}
    );

    // 選択対象やモードが変わった
    this.$watch(
        () => OperationStore_Track.operation,
        () => this.draw(),
        {deep: true}
    );

    // フレームが変わった
    this.$watch(
        () => OperationStore_Track.frame,
        () => OperationOfFramesStore.createIfNothing(OperationStore_Track.frame),
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
      const bone = annotation.bone;
      const isSelecting = OperationStore_Track.selectingObjectId == objectId;

      const boneColor = isSelecting && OperationStore_Track.isBoneMode ? this.lineActiveColor : this.lineInactiveColor;
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
          boneColor
      );
      boneLines.zIndex = 0;
      this.graphics.push(boneLines);

      const jointColor = isSelecting && OperationStore_Track.isBoneMode ? this.circleActiveColor : this.circleInactiveColor;
      const jointPositions = Object.entries(bone).filter((v) => v[0].indexOf("right") < 0).map(v => v[1]) as Point[];
      const boneJoints = new MultiCircles(jointPositions, 4, jointColor);
      boneJoints.zIndex = 1;
      this.graphics.push(boneJoints);

      const jointColorRight = isSelecting && OperationStore_Track.isBoneMode ? this.circleActiveRightColor : this.circleInactiveRightColor;
      const jointRightPositions = Object.entries(bone).filter((v) => v[0].indexOf("right") >= 0).map(v => v[1]) as Point[];
      const boneJointsRight = new MultiCircles(jointRightPositions, 4, jointColorRight);
      boneJointsRight.zIndex = 1;
      this.graphics.push(boneJointsRight);

      const boundingColor = isSelecting && OperationStore_Track.isBoundingMode ? this.lineActiveColor : this.lineInactiveColor;
      const boundingBox = new RectangleLine(
          annotation.bounding.left,
          annotation.bounding.top,
          annotation.bounding.width,
          annotation.bounding.height,
          2,
          boundingColor
      );
      boneJoints.zIndex = 3;
      this.graphics.push(boundingBox);

      const neckEquipmentColor = isSelecting && OperationStore_Track.isNeckEquipmentMode ? this.lineActiveColor : this.lineInactiveColor;
      const neckEquipmentBox = new RectangleLine(
          annotation.neck_equipment.left,
          annotation.neck_equipment.top,
          annotation.neck_equipment.width,
          annotation.neck_equipment.height,
          2,
          neckEquipmentColor
      );
      neckEquipmentBox.zIndex = 4;
      this.graphics.push(neckEquipmentBox);
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

      OperationOfFramesStore.setIsUseAnnotationFile({
        frame: frame,
        isUseAnnotationFile: true
      });
    }

    // 首装置がないデータを読んだときに削除済扱いで読み込む。
    for (const frame in AnnotationsStore_Track.annotations) {
      for (const objectId in AnnotationsStore_Track.annotations[frame]) {
        if (AnnotationsStore_Track.annotations[frame][objectId].neck_equipment == null) {
          AnnotationsStore_Track.deleteNeckEquipment({frame: frame, objectId: objectId})
        }
      }
    }

    if (AnnotationFilesStore.items.length > 0) {
      this.addHistory();
    }
  }

  private onDragStart(e: MovingPoint) {
    // バウンディング
    if (OperationStore_Track.isBoundingMode) {
      const clickedBounding = this.searchBounding(e);
      if (this.isDeleteMode) {
        // 削除
        if (clickedBounding.objectId) {

          AnnotationsStore_Track.deleteObject({
            frame: OperationStore_Track.frame,
            objectId: clickedBounding.objectId
          });


          OperationStore_Track.setSelectingObjectId("");
          OperationStore_Track.setSelectingEdge({top: false, right: false, bottom: false, left: false});
          OperationStore_Track.setSelectingNeckEquipmentEdge({
            top: false,
            right: false,
            bottom: false,
            left: false
          });
          OperationStore_Track.setSelectingJointName("");

          this.addHistory();
        }
      } else {
        // 選択
        OperationStore_Track.setSelectingObjectId(clickedBounding.objectId);
        OperationStore_Track.setSelectingEdge(clickedBounding.selectingEdge);
        OperationStore_Track.setSelectingNeckEquipmentEdge({
          top: false,
          right: false,
          bottom: false,
          left: false
        });
        OperationStore_Track.setSelectingJointName("");
      }
    }

    // ボーン
    if (OperationStore_Track.isBoneMode) {
      const clickedJoint = this.searchJoint(e);
      if (this.isDeleteMode) {
        // 削除
        AnnotationsStore_Track.deleteJoint({
          frame: OperationStore_Track.frame,
          objectId: clickedJoint.objectId,
          jointName: clickedJoint.jointName
        });

        OperationStore_Track.setSelectingObjectId(clickedJoint.objectId);
        OperationStore_Track.setSelectingEdge({top: false, right: false, bottom: false, left: false});
        OperationStore_Track.setSelectingNeckEquipmentEdge({
          top: false,
          right: false,
          bottom: false,
          left: false
        });
        OperationStore_Track.setSelectingJointName("");

        this.addHistory();
      } else {
        // 選択
        OperationStore_Track.setSelectingObjectId(clickedJoint.objectId);
        OperationStore_Track.setSelectingEdge({top: false, right: false, bottom: false, left: false});
        OperationStore_Track.setSelectingNeckEquipmentEdge({
          top: false,
          right: false,
          bottom: false,
          left: false
        });
        OperationStore_Track.setSelectingJointName(clickedJoint.jointName);
      }
    }

    // 首装置
    if (OperationStore_Track.isNeckEquipmentMode) {
      const clickedBounding = this.searchBounding(e);
      const clickedNeckEquipment = this.searchNeckEquipment(e);
      if (this.isDeleteMode) {
        // 削除
        if (clickedNeckEquipment.objectId) {

          AnnotationsStore_Track.deleteNeckEquipment({
            frame: OperationStore_Track.frame,
            objectId: clickedNeckEquipment.objectId
          });

          OperationStore_Track.setSelectingObjectId(clickedNeckEquipment.objectId);
          OperationStore_Track.setSelectingEdge({top: false, right: false, bottom: false, left: false});
          OperationStore_Track.setSelectingNeckEquipmentEdge({
            top: false,
            right: false,
            bottom: false,
            left: false
          });
          OperationStore_Track.setSelectingJointName("");
          OperationStore_Track.setModeToBounding();

          this.addHistory();
        }
      } else {
        // 選択
        OperationStore_Track.setSelectingObjectId(clickedBounding.objectId);
        OperationStore_Track.setSelectingEdge({top: false, right: false, bottom: false, left: false});
        OperationStore_Track.setSelectingNeckEquipmentEdge(clickedNeckEquipment.selectingEdge);
        OperationStore_Track.setSelectingJointName("");
      }
    }

  }

  private onDrag(e: MovingPoint) {
    // バウンディング選択
    if (OperationStore_Track.isBoundingMode) {
      if (this.selectingObject) {
        const frame = OperationStore_Track.frame;
        const objectId = OperationStore_Track.selectingObjectId;

        let bounding = DeepCloner.copy(this.selectingObject.bounding);

        const isEdgeSelect = Object.values(OperationStore_Track.selectingEdge).filter(v => v).length >= 1;
        if (isEdgeSelect) {
          // 端のドラッグは矩形の拡大縮小
          if (OperationStore_Track.selectingEdge.left) {
            bounding.left += e.deltaX;
            bounding.width -= e.deltaX;
          }
          if (OperationStore_Track.selectingEdge.right) {
            bounding.width += e.deltaX;
          }
          if (OperationStore_Track.selectingEdge.top) {
            bounding.top += e.deltaY;
            bounding.height -= e.deltaY;
          }
          if (OperationStore_Track.selectingEdge.bottom) {
            bounding.height += e.deltaY;
          }
        } else {
          // 中心部ドラッグは移動
          bounding.top += e.deltaY;
          bounding.left += e.deltaX;
        }

        AnnotationsStore_Track.setBounding({
          frame: frame,
          objectId: objectId,
          bounding: bounding
        });

        if (!isEdgeSelect) {
          // 現在座標にdeltaを足す（deltaだけ移動）
          AnnotationsStore_Track.addJointPositions({
            frame: frame,
            objectId: objectId,
            moveAmount: {x: e.deltaX, y: e.deltaY}
          })
          AnnotationsStore_Track.addNeckEquipmentPositions({
            frame: frame,
            objectId: objectId,
            moveAmount: {x: e.deltaX, y: e.deltaY}
          })
        }
      }
    }

    // ボーン選択
    if (OperationStore_Track.isBoneMode) {
      if (this.selectingJoint) {
        AnnotationsStore_Track.setJointPosition({
          frame: OperationStore_Track.frame,
          objectId: OperationStore_Track.selectingObjectId,
          jointName: OperationStore_Track.selectingJointName,
          position: e
        })
      }
    }

    // 首装置選択
    if (OperationStore_Track.isNeckEquipmentMode) {
      if (this.selectingObject) {
        const frame = OperationStore_Track.frame;
        const objectId = OperationStore_Track.selectingObjectId;

        let bounding = DeepCloner.copy(this.selectingObject.neck_equipment);
        if (bounding.left != -9999) {
          const isEdgeSelect = Object.values(OperationStore_Track.selectingNeckEquipmentEdge).filter(v => v).length >= 1;
          if (isEdgeSelect) {
            // 端のドラッグは矩形の拡大縮小
            if (OperationStore_Track.selectingNeckEquipmentEdge.left) {
              bounding.left += e.deltaX;
              bounding.width -= e.deltaX;
            }
            if (OperationStore_Track.selectingNeckEquipmentEdge.right) {
              bounding.width += e.deltaX;
            }
            if (OperationStore_Track.selectingNeckEquipmentEdge.top) {
              bounding.top += e.deltaY;
              bounding.height -= e.deltaY;
            }
            if (OperationStore_Track.selectingNeckEquipmentEdge.bottom) {
              bounding.height += e.deltaY;
            }
          } else {
            // 中心部ドラッグは移動
            bounding.top += e.deltaY;
            bounding.left += e.deltaX;
          }

          AnnotationsStore_Track.setNeckEquipment({
            frame: frame,
            objectId: objectId,
            bounding: bounding
          });
        }
      }
    }
  }

  //
  private onDragEnd(e: MovingPoint) {
    if (this.selectingObject && !this.isDeleteMode) {
      this.addHistory();
    }
  }


  private onHover(e: Point) {
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


  private searchNeckEquipment(position: Point) {
    let smallestArea = Number.MAX_VALUE;
    let smallestObjectId: string = "";
    let selectingEdge = {top: false, right: false, bottom: false, left: false};
    const edgeWidth = 0.02;

    for (const objectId in this.annotationsOfCurrentFrame) {
      const bounding = this.annotationsOfCurrentFrame[objectId].neck_equipment;
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

    for (const objectId in this.annotationsOfCurrentFrame) {
      for (const jointName in this.annotationsOfCurrentFrame[objectId].bone) {
        const bonePosition = (<any>this.annotationsOfCurrentFrame[objectId].bone)[jointName];
        const distance = PointUtil.distance(bonePosition, position);
        if (distance < 0.05 && distance < nearestDistance) {
          nearestDistance = distance;
          nearestJoint = {objectId: objectId, jointName: jointName};
        }
      }
    }

    return nearestJoint;
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
    const fileName = FileUtil.removeExtension(this.currentFileNameFull) + "___" + OperationStore_Track.frame + "___";
    FileDownloader.downloadBlob(fileName + ".png", videoImageBlob);

    const json = JSON.stringify(this.annotationsOfCurrentFrame);
    FileDownloader.downloadJsonFile(fileName + ".json", json);

    OperationOfFramesStore.setIsDownloaded({frame: OperationStore_Track.frame, isDownloaded: true});
    OperationOfFramesStore.setIsDirty({frame: OperationStore_Track.frame, isDirty: false});
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

.canvas_renderer {
  position: absolute;
  top: 0;
  left: 0;
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
