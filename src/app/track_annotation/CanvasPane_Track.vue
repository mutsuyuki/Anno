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
                @dragareastart="onDragStart"
                @dragarea="onDrag"
                @dragareaend="onDragEnd"
                @download="onDownload"
                @timeupdate="onTimeUpdate"
                :createBlobSignal="createBlobSignal"
                @prepareBlob="onPrepareBlob"
        >
            <CanvasRenderer class="canvas_renderer" :graphics="graphics"/>
            <MultiLabels :labels="labelData"/>
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
    export default class CanvasPane_Track extends Vue {
        private graphics: Graphic[] = [];

        private circleActiveColor: Color = {r: 150, g: 40, b: 0, a: 1};
        private lineActiveColor: Color = {r: 0, g: 40, b: 150, a: 1};
        private circleInactiveColor: Color = {r: 150, g: 40, b: 0, a: 0.5};
        private lineInactiveColor: Color = {r: 0, g: 40, b: 150, a: 0.5};

        private createBlobSignal: boolean = false;
        private isDeleteMode: boolean = false;

        get currentFileNameFull() {
            return VideoFileStore.name;
        }


        get isVideoSelected() {
            return VideoFileStore.isSelected;
        }

        get operationOfCurrentFrame(): OperationOfFrame {
            return OperationOfFramesStore.operations[OperationStore_Track.frame] || {};
        }

        get isUseAnnotationFile() {
            return this.operationOfCurrentFrame.isUseAnnotationFile;
        }

        get isDownloaded() {
            return this.operationOfCurrentFrame.isDownloaded && !this.operationOfCurrentFrame.isDirty;
        }

        get annotationsOfCurrentFrame(): { [objectId: number]: Annotation_Track } {
            return AnnotationsStore_Track.annotations[OperationStore_Track.frame] || {};
        }

        get labelData(): { text: string, position: Point, isActive: boolean }[] {
            let result = []
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
                    ].filter(v => v.start.x != -9999 && v.end.x != -9999),
                    2,  // width
                    boneColor
                );
                boneLines.zIndex = 0;
                this.graphics.push(boneLines);


                const jointColor = isSelecting && OperationStore_Track.isBoneMode ? this.circleActiveColor : this.circleInactiveColor;
                const boneJoints = new MultiCircles(Object.values(bone), 4, jointColor);
                boneJoints.zIndex = 1;
                this.graphics.push(boneJoints);

                const boundingColor = isSelecting && OperationStore_Track.isBoundingMode ? this.lineActiveColor : this.lineInactiveColor;
                const boundingBox = new RectangleLine(
                    annotation.bounding.left,
                    annotation.bounding.top,
                    annotation.bounding.width,
                    annotation.bounding.height,
                    2,
                    boundingColor
                );
                boneJoints.zIndex = 2;
                this.graphics.push(boundingBox);
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

                console.log(JSON.parse(fileText as string))

                AnnotationsStore_Track.setAnnotationsOfFrame({
                    frame: frame,
                    data: JSON.parse(fileText as string)
                });

                OperationOfFramesStore.setIsUseAnnotationFile({
                    frame: frame,
                    isUseAnnotationFile: true
                });
            }

            if (AnnotationFilesStore.items.length > 0) {
                this.addHistory();
            }

            console.log("bbb", AnnotationsStore_Track.annotations)
        }

        private onDragStart(e: MovingPoint) {
            // バウンディング
            if (OperationStore_Track.isBoundingMode) {
                const clickedBounding = this.getClickedBounding(e);
                if (this.isDeleteMode) {
                    // 削除
                    if (clickedBounding.objectId) {

                        AnnotationsStore_Track.deleteObject({
                            frame: OperationStore_Track.frame,
                            objectId: clickedBounding.objectId
                        });

                        OperationStore_Track.setSelectingObjectId("");
                        OperationStore_Track.setSelectingEdge({top: false, right: false, bottom: false, left: false});
                        OperationStore_Track.setSelectingJointName("");

                        this.addHistory();
                    }
                } else {
                    // 選択
                    OperationStore_Track.setSelectingObjectId(clickedBounding.objectId);
                    OperationStore_Track.setSelectingEdge(clickedBounding.selectingEdge);
                    OperationStore_Track.setSelectingJointName("");
                }
            }

            // ボーン
            if (OperationStore_Track.isBoneMode) {
                const clickedJoint = this.getClickedJoint(e);
                if (this.isDeleteMode) {
                    // 削除
                    AnnotationsStore_Track.deleteJoint({
                        frame: OperationStore_Track.frame,
                        objectId: clickedJoint.objectId,
                        jointName: clickedJoint.jointName
                    });

                    OperationStore_Track.setSelectingObjectId(clickedJoint.objectId);
                    OperationStore_Track.setSelectingEdge({top: false, right: false, bottom: false, left: false});
                    OperationStore_Track.setSelectingJointName("");

                    this.addHistory();
                } else {
                    // 選択
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
            if (this.selectingObject && !this.isDeleteMode) {
                this.addHistory();
            }
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

        private addHistory() {
            this.$emit("addHistory")
        }

        private onTimeUpdate(frame: number): void {
            OperationStore_Track.setFrame(frame.toString());
        }

        //
        private async onDownload() {
            this.createBlobSignal = !this.createBlobSignal;
        }

        private onPrepareBlob(videoImageBlob: Blob) {
            const fileName = FileUtil.removeExtension(this.currentFileNameFull) + "___" + OperationStore_Track.frame + "___";
            FileDownloader.downloadBlob(fileName + ".png", videoImageBlob);

            console.log(Object.values(this.annotationsOfCurrentFrame))
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
