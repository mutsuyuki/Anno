<template>
  <ScalableArea
      :debug="true"

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
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest<br/>

  </ScalableArea>

</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import ScalableArea from "@/components/UI/Area/ScalableArea.vue";

@Component({
  components: {ScalableArea}
})
export default class AnnotationPane extends Vue {

  private onDragStart(e: any) {
    console.log("dragstart", e)
  }

  private onDrag(e: any) {
    console.log("drag", e)
  }

  private onDragEnd(e: any) {
    console.log("dragend", e)
  }

  private onHover(e: any) {
    console.log("hover", e)
  }

  private onMoveStart(e: any) {
    console.log("dragstart", e)
  }

  private onMove(e: any) {
    console.log("drag", e)
  }

  private onMoveEnd(e: any) {
    console.log("dragend", e)
  }

  private onZoomStart(e: any) {
    console.log("zoomstart", e)
  }

  private onZoom(e: any) {
    console.log("zoom", e)
  }

  private onZoomEnd(e: any) {
    console.log("zoomend", e)
  }
}


</script>

<style scoped lang="scss">
</style>
