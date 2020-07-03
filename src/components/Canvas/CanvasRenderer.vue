<template>
    <canvas ref="canvas" :style="{'opacity':opacity}"></canvas>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import {Graphic} from "@/components/Canvas/Graphic";
    import CanvasSettingsStore from "@/store/CanvasSettingsStore";

    @Component({
        components: {}
    })
    export default class CanvasRenderer extends Vue {
        @Prop() graphics!: Graphic[];

        private canvas!: HTMLCanvasElement;
        private context!: CanvasRenderingContext2D;

        get opacity() {
            return CanvasSettingsStore.opacity;
        }

        mounted() {
            this.initVar();
            this.fitCanvasToParent();

            this.$watch(
                () => this.graphics,
                () => this.draw(),
                {deep: true}
            );

            window.addEventListener("resize", () => this.draw());

            document.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key == "i") CanvasSettingsStore.setOpacity(0);
                if (e.key == "o") CanvasSettingsStore.setOpacity(0.4);
                if (e.key == "p") CanvasSettingsStore.setOpacity(1);
            });
        }

        private initVar() {
            this.canvas = <HTMLCanvasElement>this.$el;

            const context = this.canvas.getContext("2d");
            if (!context) {
                alert("Canvasの初期化に失敗しました。");
                return;
            }
            this.context = context;
        }

        private fitCanvasToParent(): void {
            if (!this.canvas.parentElement) {
                alert("Canvasの親ノードがありません。");
                return;
            }

            const parent = this.canvas.parentElement;
            const canvas = this.$el as HTMLElement;
            const equalizeOverlaySizeToImage = () => {
                requestAnimationFrame(equalizeOverlaySizeToImage);

                const isWidthChange = canvas.getAttribute("width") != parent.clientWidth.toString();
                const isHeightChange = canvas.getAttribute("height") != parent.clientHeight.toString();
                if (isWidthChange || isHeightChange) {
                    canvas.setAttribute("width", parent.clientWidth.toString());
                    canvas.setAttribute("height", parent.clientHeight.toString());
                    this.draw();
                }
            };
            equalizeOverlaySizeToImage();
        }

        private draw() {
            this.context.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

            const sortedGraphics = this.graphics.slice().sort((a, b) => {
                if (a.zIndex > b.zIndex) return 1;
                if (a.zIndex < b.zIndex) return -1;
                return 0;
            });
            for (let i = 0; i < sortedGraphics.length; i++) {
                sortedGraphics[i].draw(this.context);
            }
        }

    }
</script>

<style scoped lang="scss"></style>
