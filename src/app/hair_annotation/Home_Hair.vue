<template>
    <div>

        <div class="main_container">
            <ControlPane_Hair class="control_pane"/>
            <div class="annotation_pane_container">
                <AnnotationPane_Hair class="annotation_pane"/>

                <!--画像サイズの計算コンポーネント todo cssだけで実現できるならこの仕組みはやめたい-->
                <ImageSizeChecker
                        @sizeChange="fitWidth"
                        :url="sizeCheckImageUrl"
                        :heightPadding="40 + 40 + 40 + 40 + 8"
                />
            </div>
        </div>

        <Help_Hair/>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import ControlPane_Hair from "@/app/hair_annotation/ControlPane_Hair.vue";
    import AnnotationPane_Hair from "@/app/hair_annotation/AnnotationPane_Hair.vue";
    import Help_Hair from "@/app/hair_annotation/Help_Hair.vue";
    import ImageSizeChecker from "@/components/SizeChecker/ImageSizeChecker.vue";
    import ImageFilesStore from "@/store/ImageFilesStore";
    import AnnotationHistoryStore from "@/store/AnnotationHistoryStore";
    import AnnotationFilesStore from "@/store/AnnotationFilesStore";
    import HelpStore from "@/store/HelpStore";

    @Component({
        components: {
            ImageSizeChecker,
            AnnotationPane_Hair,
            ControlPane_Hair,
            Help_Hair,
        },
    })
    export default class Home_Hair extends Vue {

        destroyed() {
            ImageFilesStore.clear();
            AnnotationFilesStore.clear();
            AnnotationHistoryStore.clear();
            HelpStore.hide();
        }

        get sizeCheckImageUrl() {
            return ImageFilesStore.currentItemUrl;
        }

        private fitWidth(width: number) {
            const annotationPaneElement = this.$el.getElementsByClassName("annotation_pane")[0] as HTMLElement;
            annotationPaneElement.style.width = width + "px";
        }
    }
</script>

<style lang="scss" scoped>

    .main_container {
        display: flex;
        height: calc(100vh);
        width: 100%;

        .control_pane {
            width: 200px;
            min-width: 200px;
            height: 100%;
            overflow-y: scroll;
        }

        .annotation_pane_container {
            margin: 0 auto;
            width: calc(100% - 200px);
            height: 100%;
            overflow-y: scroll;
            background-color: var(--background-canvas);

            .annotation_pane {
                min-width: 500px;
                margin: 0 auto;
            }
        }
    }

</style>


