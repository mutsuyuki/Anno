<template>

  <div class="subtitle">
    <div class="line_short"></div>
    <p>{{ text }}</p>
    <div class="line_long"></div>
  </div>

</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component({})
export default class MenuSubTitle extends Vue {
  @Prop() private text!: string;
}
</script>

<style scoped lang="scss">

.subtitle {
  display: flex;
  justify-content: left;
  align-items: center;

  .line_short {
    height: 1px;
    width: 8px;
    background-color: var(--darkgray);
  }

  p {
    padding: 0 8px;
    font-size: 10px;
    color: var(--darkgray);
  }

  .line_long {
    height: 1px;
    background-color: var(--darkgray);
    flex-grow: 1;
  }
}

</style>
