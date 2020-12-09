<template>
  <div class="class_selector" :style="{'max-height':maxHeight + 'px'}">

    <div class="row"
         v-for="row in rows"
    >
      <div class="col"
           v-for="col in cols"
      >
        <button class="button"
                v-if="isExist(row, col)"
                :title="showTooltip ? getText(row,col) : ''"
                :class="{'is_select' : getId(row,col) === selectId}"
                :style="{'font-size': fontSize + 'px'}"
                @click.prevent="$emit('select', getId(row,col))"
        >
          {{ getText(row, col) }}
        </button>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component({})
export default class ButtonGrid extends Vue {

  @Prop({default: []}) private data!: { id: string, text: string }[];
  @Prop({default: ""}) private selectId!: string;
  @Prop({default: 2}) private cols!: number;
  @Prop({default: 9999}) private maxHeight!: number;
  @Prop({default: 12}) private fontSize!: number;
  @Prop({default: false}) private showTooltip!: boolean;

  get rows() {
    return Math.ceil(this.data.length / this.cols)
  }

  private getId(row: number, col: number) {
    return this.data[this.index(row, col)].id;
  }

  private getText(row: number, col: number) {
    return this.data[this.index(row, col)].text;
  }

  private index(row: number, col: number) {
    return (row - 1) * this.cols + (col - 1);
  }

  private isExist(row: number, col: number) {
    return this.index(row, col) < this.data.length;
  }

}
</script>

<style lang="scss" scoped>

.class_selector {
  overflow-y: scroll;
}

.row {
  display: flex;
  justify-content: center;
  justify-items: center;

  &:nth-child(n+2) {
    margin-top: 8px;
  }

  .col {
    flex-grow: 1;
    min-width: 0;
    width: 100%;

    &:nth-child(n+2) {
      margin-left: 8px;
    }
  }
}

button {
  display: block;
  width: 100%;
  color: var(--white);

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.is_select {
    background-color: var(--active);
  }
}

</style>


