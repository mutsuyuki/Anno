<template>
    <div>

        <div class="main_container">
            <MenuPane_Hair class="menu_pane"/>
            <div class="canvas_pane_container">
<!--                <CanvasPane_Hair class="canvas_pane"/>-->

                <!--画像サイズの計算コンポーネント todo cssだけで実現できるならこの仕組みはやめたい-->
                <ImageSizeChecker
                        @sizeChange="fitWidth"
                        :url="sizeCheckImageUrl"
                        :heightPadding="40 + 40 + 48 + 48"
                />
            </div>
        </div>

        <Help_Hair/>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import MenuPane_Hair from "@/app/hair_annotation/MenuPane_Hair.vue";
    // import CanvasPane_Hair from "@/app/hair_annotation/CanvasPane_Hair.vue";
    import Help_Hair from "@/app/hair_annotation/Help_Hair.vue";
    import ImageSizeChecker from "@/components/SizeChecker/ImageSizeChecker.vue";
    import ImageFilesStore from "@/store/ImageFilesStore";
    import HistoryStore from "@/store/HistoryStore";
    import AnnotationFilesStore from "@/store/AnnotationFilesStore";
    import HelpStore from "@/store/HelpStore";

    @Component({
        components: {
            ImageSizeChecker,
            // CanvasPane_Hair,
            MenuPane_Hair,
            Help_Hair,
        },
    })
    export default class Home_Hair extends Vue {

        destroyed() {
            ImageFilesStore.clear();
            AnnotationFilesStore.clear();
            HistoryStore.clear();
            HelpStore.hide();
        }

        get sizeCheckImageUrl() {
            return ImageFilesStore.currentItemUrl;
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
        height: calc(100vh);
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


