<template>
  <label>
    <span>{{ label }}</span>

    <input type="number"
           :placeholder="placeholder"
           v-model="numberValue"
    >
  </label>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component({})
export default class NumberInput extends Vue {
  @Prop({default: "label"}) private label!: string;
  @Prop({default: "placeholder"}) private placeholder!: string;
  @Prop({default: 1.0}) private number!: number;

  get numberValue() {
    return this.number;
  }

  set numberValue(value: number) {
    this.$emit("change", value);
  }
}
</script>

<style scoped lang="scss">


label {
  width: 100%;
  display: flex;
  margin-top: 16px;
  justify-content: center;
  align-items: center;

  span {
    font-size: 10px;
    width: 64px;
  }

  input[type=number] {
    font-size: 12px;
    width: 100%;
    height: 32px;
    text-align: right;
  }

  .no-spin::-webkit-inner-spin-button,
  .no-spin::-webkit-outer-spin-button {
    -webkit-appearance: none !important;
    margin: 0 !important;
    -moz-appearance: textfield !important;
  }
}

</style>
