<template>
    <div>
        <div class="main_container">
            <MenuPane_ObjectDetection class="menu_pane"
                            @addHistory="addHistory"
            />
            <div class="canvas_pane_container">
                <CanvasPane_ObjectDetection class="canvas_pane"
                                  @addHistory="addHistory"
                />

                <!--画像サイズの計算コンポーネント-->
                <VideoSizeChecker
                        @sizeChange="fitWidth"
                        :url="targetMediaUrl"
                        :heightPadding="40 + 40 + 80 + 40"
                />
            </div>
        </div>

        <Help_ObjectDetection/>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import MenuPane_ObjectDetection from "@/app/object_detection_annotation/MenuPane_ObjectDetection.vue";
    import CanvasPane_ObjectDetection from "@/app/object_detection_annotation/CanvasPane_ObjectDetection.vue";
    import Help_ObjectDetection from "@/app/object_detection_annotation/Help_ObjectDetection.vue";
    import HistoryStore, {HistoryRecord} from "@/store/HistoryStore";
    import AnnotationFilesStore from "@/store/AnnotationFilesStore";
    import HelpStore from "@/store/HelpStore";
    import VideoFileStore from "@/store/VideoFileStore";
    import VideoSizeChecker from "@/components/SizeChecker/VideoSizeChecker.vue";
    import OperationStore_ObjectDetection from "@/app/object_detection_annotation/store/OperationStore_ObjectDetection";
    import OperationOfFramesStore from "@/store/OperationOfFramesStore";
    import AnnotationsStore_ObjectDetection from "@/app/object_detection_annotation/store/AnnotationsStore_ObjectDetection";

    @Component({
        components: {
            CanvasPane_ObjectDetection,
            VideoSizeChecker,
            MenuPane_ObjectDetection,
            Help_ObjectDetection,
        },
    })
    export default class Home_ObjectDetection extends Vue {

        get targetMediaUrl() {
            return VideoFileStore.url;
        }

        mounted() {
            HistoryStore.init(this.makeHistoryRecord());

            // ヒストリが変わった
            this.$watch(
                () => HistoryStore.index,
                () => {
                    const current = HistoryStore.current;
                    OperationStore_ObjectDetection.setOperation(current.value.operation);
                    OperationOfFramesStore.setOperations(current.value.operationOfFrame);
                    AnnotationsStore_ObjectDetection.setAnnotation(current.value.annotation);
                }
            );
        }

        destroyed() {
            VideoFileStore.clear();
            AnnotationFilesStore.clear();
            HistoryStore.clear();
            HelpStore.hide();
        }

        private makeHistoryRecord() {
            return new HistoryRecord({
                operation: OperationStore_ObjectDetection.operation,
                operationOfFrame: OperationOfFramesStore.operations,
                annotation: AnnotationsStore_ObjectDetection.annotations,
            });
        }

        private addHistory() {
            HistoryStore.addHistory(this.makeHistoryRecord());
            OperationOfFramesStore.setIsDirty({frame: OperationStore_ObjectDetection.frame, isDirty: true});
        }

        private fitWidth(width: number) {
            const canvasPaneElement = this.$el.getElementsByClassName("canvas_pane")[0] as HTMLElement;
            canvasPaneElement.style.width = width + "px";
        }
    }
</script>

<style lang="scss" scoped>

    .main_container {
        display: flex;
        height: 100vh;
        width: 100%;

        .menu_pane {
            width: 200px;
            min-width: 200px;
            height: 100%;
            overflow-y: scroll;
        }

        .canvas_pane_container {
            margin: 0 auto;
            width: calc(100% - 200px);
            height: 100%;
            overflow-y: scroll;
            background-color: var(--background-canvas);

            .canvas_pane {
                height: 100%;
                min-width: 500px;
                margin: 0 auto;
                padding: 0 16px;
            }
        }
    }

</style>


