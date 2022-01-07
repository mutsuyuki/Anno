<template>
    <label>
      <span>{{label}}</span>

      <input type="text"
             :placeholder="placeholder"
             @change="onChange"
             v-model="text"
      >
    </label>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import {HTMLElementEvent} from "@/common/interface/HTMLElementEvent";

@Component({ })
export default class TextInput extends Vue {
  @Prop({default:"label"}) private label!: string;
  @Prop({default:""}) private placeholder!: string;
  private text: string = "";

  private onChange(e: HTMLElementEvent<HTMLInputElement>) {
    console.log(e)
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

  input[type=text] {
    font-size: 11px;
    width: 100%;
    height: 32px;
  }
}

</style>
