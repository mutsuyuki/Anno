<template>
    <div class="canvas-pane"
         v-show="isImageSelected"
    >
        <ToolBar/>

        <AnnotationStatusBar
                class="annotation-status-bar"
                :fileName="currentFileNameFull"
                :isSetByFile="isSetByFile"
                :isDownloaded="isDownloaded"
        />

        <ImagePlayer
                @dragareastart="onDragStart"
                @dragarea="onDrag"
                @dragareaend="onDragEnd"
                @download="onDownload"
        >
            <CanvasRenderer style="position: absolute; top:0; left:0;" :graphics="graphics"/>
            <CanvasRenderer style="position: absolute; top:0; left:0;" :graphics="newGraphics"/>
        </ImagePlayer>

        <DownloadButton
                class="download-button"
                @download="onDownload"
        />

        <div class="width-slider-container"
             v-show="isLineWidthMode"
        >
            <input type="range" v-model="widthValue" min="0.000001" max="0.01" step="0.000001">
            <button @click="onClickOverlay">決定</button>
        </div>

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
    import {Annotation_Hair, Annotation_HairUtil} from "@/app/hair_annotation/Annotation_Hair";
    import ImageFilesStore from "@/store/ImageFilesStore";
    import FileUtil from "@/common/utils/FileUtil";
    import AnnotationContainer from "@/common/model/HistoryRecord";
    import AnnotationStatusBar from "@/components/AnnotationStatusBar.vue";
    import AnnotationFilesStore from "@/store/AnnotationFilesStore";
    import FileDownloader from "@/common/utils/FileDownloader";
    import ToolBar from "@/components/ToolBar.vue";
    import DownloadButton from "@/components/DownloadButton.vue";
    import HistoryStore from "@/store/HistoryStore";

    enum MODE {
        LINE_DIRECTION,
        LINE_WIDTH,
        END
    }

    @Component({
        components: {
            DownloadButton,
            ToolBar,
            AnnotationStatusBar,
            CanvasRenderer,
            ImagePlayer,
        }
    })
    export default class CanvasPane_Hair extends Vue {

        private graphics: Graphic[] = [];
        private newAnnotation: { value: Annotation_Hair } = {value: <any>{}};
        private newGraphics: Graphic[] = [];

        private mode: MODE = MODE.END;
        private isCtrlKeyDown: boolean = false;
        private widthValue: number = 0.1;
        private unWatchWidthValue!: Function;

        private circleColor: Color = {r: 150, g: 0, b: 0, a: 1};
        private lineColor: Color = {r: 0, g: 0, b: 150, a: 1};

        get currentFileNameFull() {
            return ImageFilesStore.currentItem ? ImageFilesStore.currentItem.name : "";
        }

        get currentFileName() {
            return FileUtil.removeExtension(this.currentFileNameFull)
        }

        get isImageSelected() {
            return ImageFilesStore.numberOfItems > 0;
        }

        get isLineWidthMode() {
            return this.mode == MODE.LINE_WIDTH;
        }

        get isSetByFile() {
            return this.currentAnnotation.isSetByFile;
        }

        get isDownloaded() {
            return this.currentAnnotation.isDownloaded;
        }

        get currentAnnotation() {
            return this.currentHistory[this.currentFileName] || {};
        }

        get currentHistory(): { [fileName: string]: AnnotationContainer<Annotation_Hair[]> } {
            return HistoryStore.current;
        }

        created() {

            // 画像読み込み
            this.$watch(
                () => ImageFilesStore.items,
                () => {
                    let annotations: { [fileName: string]: AnnotationContainer<Annotation_Hair[]> } = {};
                    for (let i = 0; i < ImageFilesStore.items.length; i++) {
                        const fileName = FileUtil.removeExtension(ImageFilesStore.items[i].name);
                        annotations[fileName] = new AnnotationContainer<Annotation_Hair[]>([]);
                    }

                    HistoryStore.init(annotations);
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
                        const models = Annotation_HairUtil.fileToModels(fileText as string);
                        annotations[fileName].annotation = models;
                    }

                    if (AnnotationFilesStore.items.length > 0)
                        HistoryStore.addHistory(annotations);
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
                },
                {deep: true}
            );

            // 表示対象のアノテーションたちの状態が変わった
            this.$watch(
                () => this.currentAnnotation,
                () => {
                    this.graphics = [];

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
            if (this.mode == MODE.END && !this.isCtrlKeyDown) {
                this.mode = MODE.LINE_DIRECTION;

                Vue.set(this.newAnnotation, "value", {
                    start: {x: e.x, y: e.y},
                    end: {x: e.x, y: e.y},
                    width: 0.001
                });

                return;
            }

            // 削除
            if (this.mode == MODE.END && this.isCtrlKeyDown) {
                let nearestDistance = Number.MAX_VALUE;
                let nearestAnnotation: Annotation_Hair;
                let annotations = this.currentHistory;
                for (const annotation of annotations[this.currentFileName].annotation) {
                    const distance = PointUtil.distance(annotation.start, e);
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestAnnotation = annotation;
                    }
                }

                if (nearestDistance < 0.1) {
                    annotations[this.currentFileName].annotation = annotations[this.currentFileName].annotation.filter(v => v !== nearestAnnotation);
                    HistoryStore.addHistory(annotations);
                }
            }

        }

        private onDrag(e: Point) {
            if (this.mode == MODE.LINE_DIRECTION) {
                this.newAnnotation.value.end = e;
                return;
            }
        }

        private onDragEnd(e: Point) {
            if (this.mode == MODE.LINE_DIRECTION) {
                let annotations = this.currentHistory;
                annotations[this.currentFileName].annotation.push(this.newAnnotation.value);
                HistoryStore.addHistory(annotations);
                Vue.set(this.newAnnotation, "value", {
                    start: {x: -9999, y: -9999},
                    end: {x: -9999, y: -9999},
                    width: 0
                });

                this.mode = MODE.LINE_WIDTH;
                this.widthValue = this.newAnnotation.value.width;

                this.unWatchWidthValue = this.$watch(
                    () => this.widthValue,
                    () => this.onChangeWidthValue(),
                    {immediate: true}
                );
                return;
            }
        }

        private onChangeWidthValue() {
            this.newAnnotation.value.width = this.widthValue;
        }

        private onClickOverlay(e: MouseEvent) {
            this.unWatchWidthValue();
            this.mode = MODE.END;
        }

        private async onDownload() {
            let annotations = this.currentHistory;
            annotations[this.currentFileName].isDownloaded = true;
            HistoryStore.updateCurrent(annotations);

            FileDownloader.downloadTextFile(
                this.currentFileName + ".txt",
                Annotation_HairUtil.modelsToFile(this.currentAnnotation.annotation)
            );

            FileDownloader.downloadBlob(
                ImageFilesStore.currentItem.name,
                ImageFilesStore.currentItem
            );
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
