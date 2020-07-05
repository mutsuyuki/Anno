<template>
    <div class="clip_area"
         @wheel="onWheel"
    >
        <div class="scale_area"
             :class="{'fit-animation' : (!isZooming) && (!isMoving) }"
             :style="{'transform' : 'scale3d(' + scale_ + ',' + scale_ + ',1) ' +  'translate3d(' + translateX_ + 'px,' + translateY_ + 'px, 0)'}"
        >

            <slot></slot>

            <div class="touch_area"
                 @mousedown="onMouseDown_"
                 @touchstart="onTouchStart_"
                 @mousemove="onMouseMoveForHover_"
            >
                <div v-if="debug" class="debug">
                    drag: {{isDragging}} <br>
                    move: {{isMoving}} <br>
                    zoom: {{isZooming}} <br>
                </div>
            </div>

        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import {Point, PointUtil} from "@/common/interface/Point";

    @Component
    export default class ScalableArea extends Vue {
        @Prop({default: false}) private debug!: boolean;

        private scale_: number = 1;
        private minScale: number = 1;
        private maxScale: number = 10;

        private translateX_: number = 0;
        private translateY_: number = 0;

        private isSpaceKeyDown: boolean = false;
        private isDragging: boolean = false;
        private isMoving: boolean = false;
        private isZooming: boolean = false;

        private startTranslateX: number = -1000;
        private startTranslateY: number = -1000;
        private startTouchX: number = -1000;
        private startTouchY: number = -1000;
        private lastPinchDistance: number = -1000;


        created() {
            document.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key == " ") {
                    this.isSpaceKeyDown = true;
                }
            });
            document.addEventListener("keyup", (e: KeyboardEvent) => {
                if (e.key == " ") {
                    this.isSpaceKeyDown = false;
                }
            });
        }

        // ---------------------------------
        //  ドラッグ（上にイベント通知するだけ）
        // ---------------------------------
        private dragStartPoint: Point = {x: 0, y: 0};
        private dragPrevPoint: Point = {x: 0, y: 0};

        private startDrag(x: number, y: number): void {
            this.isDragging = true;
            this.$emit("dragareastart", {
                x: x,
                y: y,
                startX: x,
                startY: y,
                deltaX: 0,
                deltaY: 0
            });
            this.dragStartPoint = {x: x, y: y};
            this.dragPrevPoint = {x: x, y: y};
            document.oncontextmenu = () => false;  // 右クリックメニュー表示の禁止
        }

        private drag(x: number, y: number) {
            const delta = PointUtil.minus({x: x, y: y}, this.dragPrevPoint);
            this.$emit("dragarea", {
                x: x,
                y: y,
                startX: this.dragStartPoint.x,
                startY: this.dragStartPoint.y,
                deltaX: delta.x,
                deltaY: delta.y
            });
            this.dragPrevPoint = {x: x, y: y};
        }

        private endDrag(x: number, y: number) {
            this.isDragging = false;
            const delta = PointUtil.minus({x: x, y: y}, this.dragPrevPoint);
            this.$emit("dragareaend", {
                x: x,
                y: y,
                startX: this.dragStartPoint.x,
                startY: this.dragStartPoint.y,
                deltaX: delta.x,
                deltaY: delta.y
            });

            setTimeout(() => {
                document.oncontextmenu = () => true; // 右クリックメニュー表示の回復
            }, 100);
        }

        // -------------------
        //  移動
        // -------------------
        private moveStartPoint: Point = {x: 0, y: 0};
        private movePrevPoint: Point = {x: 0, y: 0};

        private startMove(x: number, y: number): void {
            this.isMoving = true;

            this.startTouchX = x;
            this.startTouchY = y;
            this.startTranslateX = this.translateX_;
            this.startTranslateY = this.translateY_;
            this.$emit("movestart", {
                x: x,
                y: y,
                startX: x,
                startY: y,
                deltaX: 0,
                deltaY: 0
            });
            this.moveStartPoint = {x: x, y: y};
            this.movePrevPoint = {x: x, y: y};

            document.oncontextmenu = () => false;  // 右クリックメニュー表示の禁止

        }

        private move(x: number, y: number): void {
            this.translateX_ = this.startTranslateX + (x - this.startTouchX) / this.scale_;
            this.translateY_ = this.startTranslateY + (y - this.startTouchY) / this.scale_;
            const delta = PointUtil.minus({x: x, y: y}, this.movePrevPoint);
            this.$emit("move", {
                x: x,
                y: y,
                startX: this.moveStartPoint.x,
                startY: this.moveStartPoint.y,
                deltaX: delta.x,
                deltaY: delta.y
            });
            this.movePrevPoint = {x: x, y: y};
        }


        private endMove(x: number, y: number) {
            this.fitInside();

            this.isMoving = false;
            const delta = PointUtil.minus({x: x, y: y}, this.movePrevPoint);
            this.$emit("endmove", {
                x: x,
                y: y,
                startX: this.moveStartPoint.x,
                startY: this.moveStartPoint.y,
                deltaX: delta.x,
                deltaY: delta.y
            });

            setTimeout(() => {
                document.oncontextmenu = () => true; // 右クリックメニュー表示の回復
            }, 100);
        }

        private fitInside() {
            this.scale_ = Math.min(Math.max(this.scale_, this.minScale), this.maxScale);

            // 範囲内に戻す
            if (this.translateX_ > 0) {
                this.translateX_ = 0;
            }

            let minThreshX: number = -(this.$el.clientWidth - (this.$el.clientWidth / this.scale_));
            if (this.translateX_ < minThreshX) {
                this.translateX_ = minThreshX;
            }

            if (this.translateY_ > 0) {
                this.translateY_ = 0;
            }

            let minThreshY: number = -(this.$el.clientHeight - (this.$el.clientHeight / this.scale_));
            if (this.translateY_ < minThreshY) {
                this.translateY_ = minThreshY;
            }
        }

        // -------------------
        //  ズーム
        // -------------------
        private startZoom(x: number, y: number) {
            this.$emit("zoomstart", {x: x, y: y, scale: this.scale_})
        }


        private zoom(x: number, y: number, delta: number) {
            let newScale = this.scale_ + delta;
            if (newScale < this.minScale || newScale > this.maxScale)
                newScale = this.scale_ + delta * 0.005;

            this.scale_ = newScale;
            this.$emit("zoom", {x: x, y: y, scale: this.scale_});
        }

        private endZoom(x: number, y: number) {
            this.fitInside();
            this.$emit("zoomend", x, y, this.scale_);
        }

        // -------------------
        //  マウス
        // -------------------
        private onMouseDown_(e: MouseEvent): void {
            e.preventDefault();
            this.isDragging = false;
            this.isMoving = false;

            if (e.button == 0 && !this.isSpaceKeyDown) {
                this.startDrag(e.offsetX, e.offsetY);
            }

            if (e.button == 0 && this.isSpaceKeyDown) {
                this.startMove(e.clientX, e.clientY);
            }

            document.addEventListener("mousemove", this.onMouseMoveForListen);
            document.addEventListener("mouseup", this.onMouseUpForListen);
        }

        private onMouseMoveForListen = (e: MouseEvent) => this.onMouseMove(e);

        private onMouseMove(e: MouseEvent): void {
            e.preventDefault();

            if (this.isDragging) {
                this.drag(e.offsetX, e.offsetY);
            }

            if (this.isMoving) {
                this.move(e.clientX, e.clientY);
            }
        }

        private onMouseUpForListen = (e: MouseEvent) => this.onMouseUp(e);

        private onMouseUp(e: MouseEvent): void {
            e.preventDefault();

            if (this.isDragging) {
                this.endDrag(e.offsetX, e.offsetY)
            }

            if (this.isMoving) {
                this.endMove(e.offsetX, e.offsetY)
            }

            document.removeEventListener("mousemove", this.onMouseMoveForListen);
            document.removeEventListener("mouseup", this.onMouseUpForListen);
        }

        // ----------------------
        //   マウス（ホバー）
        // ----------------------
        private onMouseMoveForHover_(e: MouseEvent): void {
            e.preventDefault();

            if (this.isDragging || this.isMoving)
                return;

            this.$emit("hover", {x: e.offsetX, y: e.offsetY});
        }


        // -------------------
        //   タッチ
        // -------------------
        private onTouchStart_(e: TouchEvent): void {
            e.preventDefault();

            this.isDragging = false;
            this.isMoving = false;
            this.isZooming = false;

            if (e.touches.length == 1) {
                const offsetPos = this.touchEventToOffsetPos(e);
                this.startDrag(offsetPos.x, offsetPos.y);
            }

            if (e.touches.length == 2) {
                // 移動
                const clientCenter = this.calcCenterOfTwoPoints(e.touches[0].clientX, e.touches[0].clientY, e.touches[1].clientX, e.touches[1].clientY);
                this.startMove(clientCenter.x, clientCenter.y);

                // ズーム
                const offsetPos1 = this.touchEventToOffsetPos(e, 0);
                const offsetPos2 = this.touchEventToOffsetPos(e, 1);
                const offsetCenter = this.calcCenterOfTwoPoints(offsetPos1.x, offsetPos1.y, offsetPos2.x, offsetPos2.y);
                this.startZoom(offsetCenter.x, offsetCenter.y);
                this.lastPinchDistance = this.calcDistanceOfTwoPoints(e.touches[0].clientX, e.touches[0].clientY, e.touches[1].clientX, e.touches[1].clientY);
            }

            document.addEventListener("touchmove", this.onTouchMoveForListen);
            document.addEventListener("touchend", this.onTouchEndForListen);
        }

        private onTouchMoveForListen = (e: TouchEvent) => this.onTouchMove(e);

        private onTouchMove(e: TouchEvent): void {
            e.preventDefault();

            if (this.isDragging) {
                const offsetPos = this.touchEventToOffsetPos(e);
                this.drag(offsetPos.x, offsetPos.y);
            }

            if (this.isMoving) {
                // 移動
                let touchesCenterX: number = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                let touchesCenterY: number = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                this.move(touchesCenterX, touchesCenterY);

                // ズーム
                const offsetPos1 = this.touchEventToOffsetPos(e, 0);
                const offsetPos2 = this.touchEventToOffsetPos(e, 1);
                const offsetCenter = this.calcCenterOfTwoPoints(offsetPos1.x, offsetPos1.y, offsetPos2.x, offsetPos2.y);
                const currentPinchDistance: number = this.calcDistanceOfTwoPoints(e.touches[0].clientX, e.touches[0].clientY, e.touches[1].clientX, e.touches[1].clientY);
                const diffDistance: number = currentPinchDistance - this.lastPinchDistance;
                this.zoom(offsetCenter.x, offsetCenter.y, (diffDistance / 300));
                this.lastPinchDistance = currentPinchDistance;
            }
        }

        private onTouchEndForListen = (e: TouchEvent) => this.onTouchEnd(e);

        private onTouchEnd(e: TouchEvent): void {
            e.preventDefault();

            if (this.isDragging) {
                const offsetPos = this.touchEventToOffsetPos(e);
                this.endDrag(offsetPos.x, offsetPos.y)
            }

            if (this.isMoving) {
                // 移動
                let touchesCenterX: number = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                let touchesCenterY: number = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                this.endMove(touchesCenterX, touchesCenterY);

                // ズーム
                const offsetPos1 = this.touchEventToOffsetPos(e, 0);
                const offsetPos2 = this.touchEventToOffsetPos(e, 1);
                const offsetCenter = this.calcCenterOfTwoPoints(offsetPos1.x, offsetPos1.y, offsetPos2.x, offsetPos2.y);
                this.endZoom(offsetCenter.x, offsetCenter.y);
            }

            document.removeEventListener("touchmove", this.onTouchMoveForListen);
            document.removeEventListener("touchend", this.onTouchEndForListen);
        }


        private touchEventToOffsetPos(e: TouchEvent, index: number = 0): { x: number, y: number } {
            let targetClientRect = this.$el.getBoundingClientRect();
            let offsetX: number = (e.touches[index].clientX - targetClientRect.left) / this.scale_;
            let offsetY: number = (e.touches[index].clientY - targetClientRect.top) / this.scale_;
            return {x: offsetX, y: offsetY};
        }

        private calcCenterOfTwoPoints(__startX: number, __startY: number, __endX: number, __endY: number) {
            return {
                x: (__endX - __startX) / 2 + __startX,
                y: (__endY - __startY) / 2 + __startY
            }
        }

        private calcDistanceOfTwoPoints(__startX: number, __startY: number, __endX: number, __endY: number): number {
            return Math.sqrt(Math.pow(__endX - __startX, 2) + Math.pow(__endY - __startY, 2));
        }


        // -------------------
        //   ホイールイベント
        // -------------------
        private timeoutId = -1;

        private onWheel(e: WheelEvent): void {
            e.preventDefault();

            if (!this.isZooming) {
                this.startZoom(e.offsetX, e.offsetY);
            }

            this.isZooming = true;

            this.zoom(e.offsetX, e.offsetY, (-e.deltaY / 1000));

            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(() => {
                this.isZooming = false;
                this.endZoom(e.offsetX, e.offsetY)
            }, 100);
        }


    }
</script>

<style scoped lang="scss">
    .clip_area {
        overflow: hidden;
        margin: 0;
        padding: 0;

        .scale_area {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;

            position: relative;
            transform-origin: top left;

            .touch_area {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }

            &.fit-animation {
                transition: transform 0.3s ease;
            }
        }

        .debug {
            display: flex;
            justify-content: center;
            color: white;
            background: rgba(0, 0, 0, 0.5);
        }

    }
</style>
