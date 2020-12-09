<template>

  <div class="footer">
    <div class="icon"
         @click="$emit('help')"
    >
      <img :src="require('@/assets/img/icons/help.svg')"/>
    </div>
    <div class="copy">{{ text }}</div>
  </div>

</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component({})
export default class MenuFooter extends Vue {
  @Prop() private text!: string;
}
</script>

<style scoped lang="scss">

.footer {
  display: flex;
  justify-content: left;
  align-items: center;
  background: var(--background-dark);
  height: 40px;

  .icon {
    padding: 12px;
    background: var(--background-light);
    cursor: pointer;

    img {
      width: 16px;
      height: 16px;
    }
  }

  .copy {
    height: 40px;
    line-height: 40px;
    font-size: 12px;
    width: 100%;
    margin-left: 12px;
  }
}

</style>
