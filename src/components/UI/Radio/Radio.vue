<template>
  <div>
    <label
        v-for="data in dataList"
        :style="{'display': isVertical ? 'block' : 'inline-block'}"
    >
      <input type="radio"
             :value="data.value"
             :checked="checked === data.value"
             @change="(e) => onChange(e, data.value)"
      >
      <span>{{ data.label }}</span>
    </label>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component({})
export default class Radio extends Vue {
  @Prop({default: ""}) private id!: string;
  @Prop({default: []}) private dataList!: { "label": string, "value": string | number }[];
  @Prop({default: ""}) private checked!: string | number;
  @Prop({default: true}) private isVertical!: boolean;

  private onChange(e: HTMLElement, value: string | number) {
    (document.activeElement as HTMLElement).blur();
    this.$emit('select', value)
  }
}
</script>

<style scoped lang="scss">

label {
}

input {
  margin-left: 8px;
}

span {
  margin-left: 8px;
}

</style>
