<template>
    <ScalableArea
            @dragareastart="onDragStart"
            @dragarea="onDrag"
            @dragareaend="onDragEnd"
            @hover="onHover"
            @movestart="onMoveStart"
            @move="onMove"
            @moveend="onMoveEnd"
            @zoomstart="onZoomStart"
            @zoom="onZoom"
            @zoomend="onZoomEnd"
    >
        <slot></slot>
    </ScalableArea>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import ScalableArea from "@/components/ScalableArea/ScalableArea.vue";
    import {Point, PointAndScale} from "@/common/interface/Point";

    @Component({
        components: {ScalableArea}
    })
    export default class NormalizedScalableArea extends Vue {
        private normalize(point: Point): Point {
            return {
                x: point.x / this.$el.clientWidth,
                y: point.y / this.$el.clientHeight
            }
        }

        private onDragStart(e: Point) {
            this.$emit("dragareastart", this.normalize(e));
        }

        private onDrag(e: Point) {
            this.$emit("dragarea", this.normalize(e));
        }

        private onDragEnd(e: Point) {
            this.$emit("dragareaend", this.normalize(e));
        }

        private onHover(e: Point) {
            this.$emit("hover", this.normalize(e));
        }

        private onMoveStart(e: Point) {
            this.$emit("movestart", this.normalize(e));
        }

        private onMove(e: Point) {
            this.$emit("move", this.normalize(e));
        }

        private onMoveEnd(e: Point) {
            this.$emit("move", this.normalize(e));
        }

        private onZoomStart(e: PointAndScale) {
            this.$emit("zoomstart", Object.assign(this.normalize(e), {scale: e.scale}));
        }

        private onZoom(e: PointAndScale) {
            this.$emit("zoom", Object.assign(this.normalize(e), {scale: e.scale}));
        }

        private onZoomEnd(e: PointAndScale) {
            this.$emit("zoomend", Object.assign(this.normalize(e), {scale: e.scale}));
        }
    }
</script>

<style scoped lang="scss">

    .image_area {
        display: flex;
        justify-content: center;
        position: relative;

        img {
            width: 100%;
        }

        .overlay-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            background: rgba(blue, 0.2);
            pointer-events: none;
        }
    }

    .downloadPanel {
        display: flex;
        justify-content: center;
        padding: 8px;
        font-size: 12px;
        color: var(--gray);
    }

    .selector_area {
        margin-top: 16px;
        display: flex;
        justify-content: center;
        align-items: center;

        button {
            margin: 0 8px;
        }

        .page_display {
            margin: 0 32px;
            display: flex;
            justify-content: center;
            align-items: flex-end;

            input[type="number"] {
                font-size: 18px;
                width: 64px;
                height: 32px;
                text-align: right;
            }

            .divider {
                font-size: 12px;
                margin-left: 8px;
                color: var(--darkgray);
            }

            .total-page {
                font-size: 12px;
                margin-left: 8px;
                color: var(--darkgray);
            }

        }
    }
</style>
