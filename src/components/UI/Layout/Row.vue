<template>
  <div class="row">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import FileSelector from "@/components/UI/Button/FileSelector.vue";

@Component({
  components: {FileSelector}
})
export default class Row extends Vue {
}

</script>

<style scoped lang="scss">

.row :nth-child(n + 2) {
  margin-top: 8px;
}

</style>
