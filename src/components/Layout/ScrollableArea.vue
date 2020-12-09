<template>
  <div class="scrollable_area">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component({
  components: {}
})
export default class ScrollableArea extends Vue {
}
</script>

<style scoped lang="scss">
.scrollable_area {
  overflow: scroll;

  &::-webkit-scrollbar {
    width: 4px;
  }
}
</style>
