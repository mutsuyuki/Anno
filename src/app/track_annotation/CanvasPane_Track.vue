<template>
    <div class="canvas-pane"
         v-show="isVideoSelected"
    >
        <ToolBar/>

        <AnnotationStatusBar
                class="annotation-status-bar"
                :fileName="currentFileNameFull"
                :isSetByFile="isSetByFile"
                :isDownloaded="isDownloaded"
        />

        <VideoPlayer
                @dragareastart="onDragStart"
                @dragarea="onDrag"
                @dragareaend="onDragEnd"
                @download="onDownload"
                @timeupdate="onTimeUpdate"
        >
            <CanvasRenderer class="canvas_renderer" :graphics="graphics"/>
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
    import Circle from "@/components/Canvas/Circle";
    import ScaleLine from "@/components/Canvas/ScaleLine";
    import {Graphic} from "@/components/Canvas/Graphic";
    import {MovingPoint, Point, PointUtil} from "@/common/interface/Point";
    import {Color} from "@/common/interface/Color";
    import FileUtil from "@/common/utils/FileUtil";
    import AnnotationContainer from "@/common/model/AnnotationContainer";
    import AnnotationStatusBar from "@/components/AnnotationStatusBar.vue";
    import AnnotationFilesStore from "@/store/AnnotationFilesStore";
    import FileDownloader from "@/common/utils/FileDownloader";
    import ToolBar from "@/components/ToolBar.vue";
    import DownloadButton from "@/components/DownloadButton.vue";
    import AnnotationHistoryStore from "@/store/AnnotationHistoryStore";
    import VideoFileStore from "@/store/VideoFileStore";
    import VideoPlayer from "@/components/Player/VideoPlayer.vue";
    import OperationStore_Track from "@/app/track_annotation/store/OperationStore_Track";
    import AnnotationsStore_Track, {Annotation_Track} from "@/app/track_annotation/store/AnnotationsStore_Track";
    import MultiLines from "@/components/Canvas/MultiLines";
    import MultiCircles from "@/components/Canvas/MultiCircles";
    import RectangleLine from "@/components/Canvas/RectangleLine";
    import DeepCloner from "@/common/utils/DeepCloner";

    @Component({
        components: {
            VideoPlayer,
            DownloadButton,
            ToolBar,
            AnnotationStatusBar,
            CanvasRenderer,
            ImagePlayer,
        }
    })
    export default class CanvasPane_Track extends Vue {
        //
        private graphics: Graphic[] = [];
        //
        // private isCtrlKeyDown: boolean = false;
        //
        private circleColor: Color = {r: 150, g: 0, b: 0, a: 1};
        private lineColor: Color = {r: 0, g: 0, b: 150, a: 1};
        //
        private videoCurrentTime: number = 0;

        get currentFileNameFull() {
            return VideoFileStore.name;
        }

        get currentFileNameWithTime() {
            return FileUtil.removeExtension(this.currentFileNameFull) + "___" + this.videoCurrentTime + "___";
        }

        get isVideoSelected() {
            return VideoFileStore.isSelected;
        }

        get isSetByFile() {
            return false;
        }

        get isDownloaded() {
            return false;
        }

        get annotationsOfCurrentFrame(): { [objectId: number]: Annotation_Track } {
            return AnnotationsStore_Track.annotations[OperationStore_Track.frame] || {};
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

            // // 動画読み込み
            // this.$watch(
            //     () => VideoFileStore.url,
            //     () => {
            //         let annotations: { [fileName: string]: AnnotationContainer<Annotation_Track[]> } = {};
            //         AnnotationHistoryStore.init(annotations);
            //     },
            //     {deep: true}
            // );
            //
            // // 教師データ読み込み
            // this.$watch(
            //     () => AnnotationFilesStore.items,
            //     async () => {
            //         // let annotations = this.currentHistory;
            //         // for (let i = 0; i < AnnotationFilesStore.items.length; i++) {
            //         //     const fileName = FileUtil.removeExtension(AnnotationFilesStore.items[i].name);
            //         //     if (!annotations[fileName])
            //         //         continue;
            //         //
            //         //     annotations[fileName].isSetByFile = true;
            //         //
            //         //     const fileText = await new Promise(resolve => {
            //         //         const reader = new FileReader();
            //         //         reader.onload = () => {
            //         //             resolve(reader.result);
            //         //         };
            //         //         reader.readAsText(AnnotationFilesStore.items[i]);
            //         //     });
            //         //     const models = AnnotationUtil_Track.fileToModels(fileText as string);
            //         //     annotations[fileName].annotation = models;
            //         // }
            //         //
            //         // if (AnnotationFilesStore.items.length > 0)
            //         //     AnnotationHistoryStore.addHistory(annotations);
            //     },
            //     {deep: true}
            // );

            // 表示対象のアノテーションたちの状態が変わった
            this.$watch(
                () => this.annotationsOfCurrentFrame,
                () => this.draw(),
                {deep: true}
            );

            //
            // // 削除用のCtrlキー検出
            // document.addEventListener("keydown", (e) => {
            //     if (e.key == "Control") {
            //         this.isCtrlKeyDown = true;
            //     }
            // });
            // document.addEventListener("keyup", (e) => {
            //     if (e.key == "Control") {
            //         this.isCtrlKeyDown = false;
            //     }
            // })
        }

        private draw() {
            this.graphics = [];

            for (const objectId in this.annotationsOfCurrentFrame) {
                const annotation = this.annotationsOfCurrentFrame[objectId];
                const bone = annotation.bone;

                const boneLines = new MultiLines(
                    [
                        {start: bone.head, end: bone.neck},
                        {start: bone.neck, end: bone.chest},
                        {start: bone.chest, end: bone.left_shoulder},
                        {start: bone.left_shoulder, end: bone.left_elbow},
                        {start: bone.left_elbow, end: bone.left_wrist1},
                        {start: bone.left_wrist1, end: bone.left_wrist2},
                        {start: bone.chest, end: bone.right_shoulder},
                        {start: bone.right_shoulder, end: bone.right_elbow},
                        {start: bone.right_elbow, end: bone.right_wrist1},
                        {start: bone.right_wrist1, end: bone.right_wrist2},
                        {start: bone.chest, end: bone.pelvis},
                        {start: bone.pelvis, end: bone.left_hip},
                        {start: bone.left_hip, end: bone.left_knee},
                        {start: bone.left_knee, end: bone.left_ankle1},
                        {start: bone.left_ankle1, end: bone.left_ankle2},
                        {start: bone.pelvis, end: bone.right_hip},
                        {start: bone.right_hip, end: bone.right_knee},
                        {start: bone.right_knee, end: bone.right_ankle1},
                        {start: bone.right_ankle1, end: bone.right_ankle2},
                    ],
                    2,  // width
                    this.lineColor
                );
                boneLines.zIndex = 0;
                this.graphics.push(boneLines);

                const boneJoints = new MultiCircles(Object.values(bone), 4, this.circleColor);
                boneJoints.zIndex = 1;
                this.graphics.push(boneJoints);

                const boundingBox = new RectangleLine(
                    annotation.bounding.left,
                    annotation.bounding.top,
                    annotation.bounding.width,
                    annotation.bounding.height,
                    2,
                    this.lineColor
                );
                boneJoints.zIndex = 2;
                this.graphics.push(boundingBox);
            }
        }

        private onDragStart(e: MovingPoint) {
            // バウンディング選択
            if (OperationStore_Track.isBoundingMode) {
                if (!OperationStore_Track.isDeleteMode) {
                    const clickedBounding = this.getClickedBounding(e);
                    OperationStore_Track.setSelectingObjectId(clickedBounding.objectId);
                    OperationStore_Track.setSelectingEdge(clickedBounding.selectingEdge);
                    OperationStore_Track.setSelectingJointName("");
                }
            }

            // ボーン選択
            if (OperationStore_Track.isBoneMode) {
                if (!OperationStore_Track.isDeleteMode) {
                    const clickedJoint = this.getClickedJoint(e);
                    OperationStore_Track.setSelectingObjectId(clickedJoint.objectId);
                    OperationStore_Track.setSelectingEdge({top: false, right: false, bottom: false, left: false});
                    OperationStore_Track.setSelectingJointName(clickedJoint.jointName);
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
                        AnnotationsStore_Track.addJointPositions({
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
        }

        //
        private onDragEnd(e: MovingPoint) {
            //
            // if (!this.isCtrlKeyDown) {
            //     let annotations = this.currentHistory;
            //     if (!annotations[this.currentFileNameWithTime])
            //         annotations[this.currentFileNameWithTime] = new AnnotationContainer<Annotation_Track[]>([]);
            //
            //     annotations[this.currentFileNameWithTime].annotation.push(this.newAnnotation.value);
            //     AnnotationHistoryStore.addHistory(annotations);
            //     Vue.set(this.newAnnotation, "value", {
            //         start: {x: -9999, y: -9999},
            //         end: {x: -9999, y: -9999},
            //         width: 0
            //     });
            // }
        }

        private getClickedBounding(clickedPosition: Point) {
            let smallestArea = Number.MAX_VALUE;
            let smallestObjectId: string = "";
            let selectingEdge = {top: false, right: false, bottom: false, left: false};
            const edgeWidth = 0.02;

            for (const objectId in this.annotationsOfCurrentFrame) {
                const bounding = this.annotationsOfCurrentFrame[objectId].bounding;
                const x = clickedPosition.x;
                const y = clickedPosition.y;
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

        private getClickedJoint(clickedPosition: Point) {
            let nearestDistance = Number.MAX_VALUE;
            let nearestJoint: { objectId: string, jointName: string } = {objectId: "", jointName: ""};

            for (const objectId in this.annotationsOfCurrentFrame) {
                for (const jointName in this.annotationsOfCurrentFrame[objectId].bone) {
                    const bonePosition = (<any>this.annotationsOfCurrentFrame[objectId].bone)[jointName];
                    const distance = PointUtil.distance(bonePosition, clickedPosition);
                    if (distance < 0.1 && distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestJoint = {objectId: objectId, jointName: jointName};
                    }
                }
            }

            return nearestJoint;
        }

        private onTimeUpdate(frame: number): void {
            OperationStore_Track.setFrame(frame.toString());
        }

        //
        private async onDownload() {
            //     // let annotations = this.currentHistory;
            //     // annotations[this.currentFileNameWithTime].isDownloaded = true;
            //     // AnnotationHistoryStore.updateCurrent(annotations);
            //     //
            //     // FileDownloader.downloadTextFile(
            //     //     this.currentFileNameWithTime + ".txt",
            //     //     AnnotationUtil_Track.modelsToFile(this.currentAnnotation.annotation)
            //     // );
            //     //
            //     // FileDownloader.downloadBlob(
            //     //     ImageFilesStore.currentItem.name,
            //     //     ImageFilesStore.currentItem
            //     // );
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
