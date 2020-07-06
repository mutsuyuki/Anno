<template>
    <div>

        <div class="main_container">
            <MenuPane_Track class="menu_pane"
                            @addHistory="addHistory"
            />
            <div class="canvas_pane_container">
                <CanvasPane_Track class="canvas_pane"
                                  @addHistory="addHistory"
                />

                <!--画像サイズの計算コンポーネント todo cssだけで実現できるならこの仕組みはやめたい-->
                <VideoSizeChecker
                        @sizeChange="fitWidth"
                        :url="sizeCheckVideoUrl"
                        :heightPadding="40 + 40 + 80 + 40"
                />
            </div>
        </div>

        <Help_Track/>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import MenuPane_Track from "@/app/track_annotation/MenuPane_Track.vue";
    import CanvasPane_Track from "@/app/track_annotation/CanvasPane_Track.vue";
    import Help_Track from "@/app/track_annotation/Help_Track.vue";
    import ImageSizeChecker from "@/components/SizeChecker/ImageSizeChecker.vue";
    import ImageFilesStore from "@/store/ImageFilesStore";
    import HistoryStore, {HistoryRecord} from "@/store/HistoryStore";
    import AnnotationFilesStore from "@/store/AnnotationFilesStore";
    import HelpStore from "@/store/HelpStore";
    import VideoFileStore from "@/store/VideoFileStore";
    import VideoSizeChecker from "@/components/SizeChecker/VideoSizeChecker.vue";
    import OperationStore_Track from "@/app/track_annotation/store/OperationStore_Track";
    import OperationOfFramesStore from "@/store/OperationOfFramesStore";
    import AnnotationsStore_Track from "@/app/track_annotation/store/AnnotationsStore_Track";

    @Component({
        components: {
            CanvasPane_Track,
            VideoSizeChecker,
            ImageSizeChecker,
            MenuPane_Track,
            Help_Track,
        },
    })
    export default class Home_Track extends Vue {

        get sizeCheckVideoUrl() {
            return VideoFileStore.url;
        }

        mounted() {
            HistoryStore.init(this.makeHistoryRecord());

            // ヒストリが変わった
            this.$watch(
                () => HistoryStore.index,
                () => {
                    const current = HistoryStore.current;
                    OperationStore_Track.setOperation(current.value.operation);
                    OperationOfFramesStore.setOperations(current.value.operationOfFrame);
                    AnnotationsStore_Track.setAnnotation(current.value.annotation);
                },
                {deep: true}
            );
        }

        destroyed() {
            ImageFilesStore.clear();
            AnnotationFilesStore.clear();
            HistoryStore.clear();
            HelpStore.hide();
        }

        private makeHistoryRecord() {
            return new HistoryRecord({
                operation: OperationStore_Track.operation,
                operationOfFrame: OperationOfFramesStore.operations,
                annotation: AnnotationsStore_Track.annotations,
            });
        }

        private addHistory() {
            HistoryStore.addHistory(this.makeHistoryRecord());
            OperationOfFramesStore.setIsDirty({frame: OperationStore_Track.frame, isDirty: true});
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


