<template>
  <div class="row">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component({
  components: {}
})
export default class Row extends Vue {
}

</script>

<style scoped lang="scss">

.row {
  margin-top: 8px;

  & > * {
    margin-top: 8px;
  }
}



</style>
