<template>
    <div class="annotation-pane"
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
            <CanvasRenderer class="canvas_renderer" :graphics="newGraphics"/>
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
    import {Annotation_Track, Annotation_TrackUtil} from "@/app/track_annotation/Annotation_Track";
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
    export default class AnnotationPane_Track extends Vue {

        private graphics: Graphic[] = [];
        private newAnnotation: { value: Annotation_Track } = {value: <any>{}};
        private newGraphics: Graphic[] = [];

        private isCtrlKeyDown: boolean = false;
        private widthValue: number = 0.1;
        private unWatchWidthValue!: Function;

        private circleColor: Color = {r: 150, g: 0, b: 0, a: 1};
        private lineColor: Color = {r: 0, g: 0, b: 150, a: 1};

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
            return this.currentAnnotation.isSetByFile;
        }

        get isDownloaded() {
            return this.currentAnnotation.isDownloaded;
        }

        get currentAnnotation() {
            return this.currentHistory[this.currentFileNameWithTime] || {};
        }

        get currentHistory(): { [fileName: string]: AnnotationContainer<Annotation_Track[]> } {
            return AnnotationHistoryStore.current || {};
        }

        created() {

            // 画像読み込み
            this.$watch(
                () => ImageFilesStore.items,
                () => {
                    let annotations: { [fileName: string]: AnnotationContainer<Annotation_Track[]> } = {};
                    AnnotationHistoryStore.init(annotations);
                },
                {deep: true}
            );

            // 教師データ読み込み
            this.$watch(
                () => AnnotationFilesStore.items,
                async () => {
                    let annotations = this.currentHistory;
                    for (let i = 0; i < AnnotationFilesStore.items.length; i++) {
                        const fileName = FileUtil.removeExtension(AnnotationFilesStore.items[i].name);
                        if (!annotations[fileName])
                            continue;

                        annotations[fileName].isSetByFile = true;

                        const fileText = await new Promise(resolve => {
                            const reader = new FileReader();
                            reader.onload = () => {
                                resolve(reader.result);
                            };
                            reader.readAsText(AnnotationFilesStore.items[i]);
                        });
                        const models = Annotation_TrackUtil.fileToModels(fileText as string);
                        annotations[fileName].annotation = models;
                    }

                    if (AnnotationFilesStore.items.length > 0)
                        AnnotationHistoryStore.addHistory(annotations);
                },
                {deep: true}
            );

            // 新規編集中のアノテーションの状態が変わった
            this.$watch(
                () => this.newAnnotation,
                () => {
                    this.newGraphics = [];
                    const annotation = this.newAnnotation.value;

                    const circle = new Circle(annotation.start, 2, this.circleColor);
                    circle.zIndex = 1;
                    this.newGraphics.push(circle);

                    const line = new ScaleLine(annotation.start, annotation.end, annotation.width, this.lineColor);
                    line.zIndex = 0;
                    this.newGraphics.push(line);

                    console.log("aaaaaaaa")
                },
                {deep: true}
            );

            // 表示対象のアノテーションたちの状態が変わった
            this.$watch(
                () => this.currentAnnotation,
                () => {

                    this.graphics = [];

                    if (!this.currentAnnotation.annotation)
                        return;

                    for (let i = 0; i < this.currentAnnotation.annotation.length; i++) {
                        const annotation = this.currentAnnotation.annotation[i];

                        const circle = new Circle(annotation.start, 2, this.circleColor);
                        circle.zIndex = 1;
                        this.graphics.push(circle);

                        const line = new ScaleLine(annotation.start, annotation.end, annotation.width, this.lineColor);
                        line.zIndex = 0;
                        this.graphics.push(line);
                    }
                },
                {deep: true}
            );

            // 削除用のCtrlキー検出
            document.addEventListener("keydown", (e) => {
                if (e.key == "Control") {
                    this.isCtrlKeyDown = true;
                }
            });
            document.addEventListener("keyup", (e) => {
                if (e.key == "Control") {
                    this.isCtrlKeyDown = false;
                }
            })
        }

        private onDragStart(e: Point) {
            // ドラッグ開始
            if (!this.isCtrlKeyDown) {
                Vue.set(this.newAnnotation, "value", {
                    start: {x: e.x, y: e.y},
                    end: {x: e.x, y: e.y},
                    width: 0.001
                });

                return;
            }

            // 削除
            if (this.isCtrlKeyDown) {
                let nearestDistance = Number.MAX_VALUE;
                let nearestAnnotation: Annotation_Track;
                let annotations = this.currentHistory;
                for (const annotation of annotations[this.currentFileNameWithTime].annotation) {
                    const distance = PointUtil.distance(annotation.start, e);
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestAnnotation = annotation;
                    }
                }

                if (nearestDistance < 0.1) {
                    annotations[this.currentFileNameWithTime].annotation = annotations[this.currentFileNameWithTime].annotation.filter(v => v !== nearestAnnotation);
                    AnnotationHistoryStore.addHistory(annotations);
                }
            }

        }

        private onDrag(e: Point) {
            this.newAnnotation.value.end = e;
        }

        private onDragEnd(e: Point) {
            let annotations = this.currentHistory;
            if (!annotations[this.currentFileNameWithTime])
                annotations[this.currentFileNameWithTime] = new AnnotationContainer<Annotation_Track[]>([]);

            annotations[this.currentFileNameWithTime].annotation.push(this.newAnnotation.value);
            AnnotationHistoryStore.addHistory(annotations);
            Vue.set(this.newAnnotation, "value", {
                start: {x: -9999, y: -9999},
                end: {x: -9999, y: -9999},
                width: 0
            });

        }

        private async onDownload() {
            let annotations = this.currentHistory;
            annotations[this.currentFileNameWithTime].isDownloaded = true;
            AnnotationHistoryStore.updateCurrent(annotations);

            FileDownloader.downloadTextFile(
                this.currentFileNameWithTime + ".txt",
                Annotation_TrackUtil.modelsToFile(this.currentAnnotation.annotation)
            );

            FileDownloader.downloadBlob(
                ImageFilesStore.currentItem.name,
                ImageFilesStore.currentItem
            );
        }
    }

</script>

<style scoped lang="scss">

    @import "../../assets/scss/parts/button";

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
