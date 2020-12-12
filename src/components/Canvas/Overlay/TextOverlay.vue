<template>
  <div class="text_overlay">
    <div
        v-for="label in labels"
        class="label"
        :class="{'active': label.isActive}"
        :style="{'left':label.position.x +'%','top':label.position.y + '%'}"
    >
      {{ label.text }}
    </div>
  </div>

</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import {Point} from "@/common/interface/Point";

@Component({
  components: {}
})
export default class TextOverlay extends Vue {
  @Prop() private labels!: { text: string, position: Point, isActive: boolean }[];
}
</script>

<style scoped lang="scss">

.text_overlay {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;

  .label {
    position: absolute;
    z-index: 100;
    height: 24px;
    line-height: 24px;
    font-size: 12px;
    font-weight: bold;
    color: var(--white);
    text-align: center;
    padding: 0;
    pointer-events: none;
    transform: translateY(calc(-100%));
    overflow: hidden;
    text-shadow: 1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000;

    opacity: 0.4;

    &.active {
      opacity: 0.7;
    }
  }
}


</style>
