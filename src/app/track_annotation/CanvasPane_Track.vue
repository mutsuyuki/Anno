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
                @timeupdate="videoCurrentTime = $event"
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
    import {Point, PointUtil} from "@/common/interface/Point";
    import {Color} from "@/common/interface/Color";
    import ImageFilesStore from "@/store/ImageFilesStore";
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

        //
        // get currentHistory(): { [fileName: string]: AnnotationContainer<Annotation_Track[]> } {
        //     return AnnotationHistoryStore.current;
        // }
        //
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

            // // 新規編集中のアノテーションの状態が変わった
            // this.$watch(
            //     () => this.newAnnotation,
            //     () => {
            //         // this.newGraphics = [];
            //         // const annotation = this.newAnnotation.value;
            //         //
            //         // const circle = new Circle(annotation.start, 2, this.circleColor);
            //         // circle.zIndex = 1;
            //         // this.newGraphics.push(circle);
            //         //
            //         // const line = new ScaleLine(annotation.start, annotation.end, annotation.width, this.lineColor);
            //         // line.zIndex = 0;
            //         // this.newGraphics.push(line);
            //     },
            //     {deep: true}
            // );

            // 表示対象のアノテーションたちの状態が変わった
            this.$watch(
                () => this.annotationsOfCurrentFrame,
                () => {
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

                        const boneJoints = new MultiCircles(
                            Object.values(bone).map(v => {
                                return {
                                    center: v,
                                    radius: 4,
                                    color: this.circleColor
                                }
                            })
                        );
                        boneJoints.zIndex = 1;
                        this.graphics.push(boneJoints);

                    }
                },
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

        private onDragStart(e: Point) {
            //     // // ドラッグ開始
            //     // if (!this.isCtrlKeyDown) {
            //     //     Vue.set(this.newAnnotation, "value", {
            //     //         start: {x: e.x, y: e.y},
            //     //         end: {x: e.x, y: e.y},
            //     //         width: 0.001
            //     //     });
            //     //
            //     //     return;
            //     // }
            //     //
            //     // // 削除
            //     // if (this.isCtrlKeyDown) {
            //     //     let nearestDistance = Number.MAX_VALUE;
            //     //     let nearestAnnotation: Annotation_Track;
            //     //     let annotations = this.currentHistory;
            //     //     for (const annotation of annotations[this.currentFileNameWithTime].annotation) {
            //     //         const distance = PointUtil.distance(annotation.start, e);
            //     //         if (distance < nearestDistance) {
            //     //             nearestDistance = distance;
            //     //             nearestAnnotation = annotation;
            //     //         }
            //     //     }
            //     //
            //     //     if (nearestDistance < 0.1) {
            //     //         annotations[this.currentFileNameWithTime].annotation = annotations[this.currentFileNameWithTime].annotation.filter(v => v !== nearestAnnotation);
            //     //         AnnotationHistoryStore.addHistory(annotations);
            //     //         console.log("bbbbba")
            //     //     }
            //     // }
        }

        //
        private onDrag(e: Point) {
            //     // this.newAnnotation.value.end = e;
        }

        //
        private onDragEnd(e: Point) {
            //     //
            //     // if (!this.isCtrlKeyDown) {
            //     //     let annotations = this.currentHistory;
            //     //     if (!annotations[this.currentFileNameWithTime])
            //     //         annotations[this.currentFileNameWithTime] = new AnnotationContainer<Annotation_Track[]>([]);
            //     //
            //     //     annotations[this.currentFileNameWithTime].annotation.push(this.newAnnotation.value);
            //     //     AnnotationHistoryStore.addHistory(annotations);
            //     //     Vue.set(this.newAnnotation, "value", {
            //     //         start: {x: -9999, y: -9999},
            //     //         end: {x: -9999, y: -9999},
            //     //         width: 0
            //     //     });
            //     // }
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
