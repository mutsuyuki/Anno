<template>
  <div class="graph_root" ref="graph_root"></div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import GraphValue from "@/components/Graph/core/GraphValue";
import {LinearX} from "@/components/Graph/core/Types";
import LineGraphSample from "@/components/Graph/sample/LineGraphSample";

@Component({
  components: {}
})
export default class LineGraph extends Vue {

  private graph: LineGraphSample | null = null;
  @Prop({default: () => []}) private dataset!: GraphValue<LinearX>[];
  @Prop({default: () => []}) private annotation!: GraphValue<LinearX>[];
  @Prop({default: 0}) private currentTime!: number;
  @Prop({default: 120}) private displayTimeSize!: number;
  @Prop({default: 120}) private displayPointSize!: number;


  mounted() {
    // 実際には渡してもらう
    this.dataset.push(new GraphValue(
        0,
        [
          Math.random() * 0.4 - 0.2,
          Math.random() * 0.4 - 0.2,
          Math.random() * 0.4 - 0.2,
        ])
    )

    for (let i = 1; i < 89.47 * 30; i++) {
      this.dataset.push(new GraphValue(
          i / 30,
          [
            this.dataset[i-1].yValues[0] + Math.random() * 0.04 - 0.02,
            this.dataset[i-1].yValues[1] + Math.random() * 0.04 - 0.02,
            this.dataset[i-1].yValues[2] + Math.random() * 0.04 - 0.02,
          ])
      )
    }

    this.graph = new LineGraphSample(this.$refs.graph_root as HTMLElement);
    this.graph.marginTop = 16;
    this.graph.marginLeft = 30;
    this.graph.marginBottom = 24;
    this.graph.marginRight = 8;

    this.$watch(() => this.dataset, () => this.update(), {deep: true});
    this.$watch(() => this.currentTime, () => this.update());
    this.$watch(() => this.displayTimeSize, () => this.update());
    this.$watch(() => this.displayPointSize, () => this.update());
    this.update();
  }

  private update() {
    if (!this.graph) {
      return;
    }
    const startIndex = this.dataset.findIndex((value) => {
      return value.xValue >= this.currentTime;
    });

    const targetValues = this.dataset.filter((_, i: number) => {
      return i >= startIndex && i <= startIndex + this.displayTimeSize;
    });

    const values = [];
    for (let i = 0; i < this.displayPointSize - 1; i++) {
      const startIndex = Math.floor(i * this.displayTimeSize / this.displayPointSize);
      const endIndex = Math.floor((i + 1) * this.displayTimeSize / this.displayPointSize);

      let xValue = targetValues[startIndex].xValue;
      let meanYValues = Array(targetValues[startIndex].yValues.length).fill(0);
      for (let j = startIndex; j < endIndex; j++) {
        const targetValue = targetValues[j];
        for (let k = 0; k < targetValue.yValues.length; k++) {
          meanYValues[k] += targetValue.yValues[k];
        }
      }

      // yの平均を求める
      for (let k = 0; k < meanYValues.length; k++) {
        meanYValues[k] /= endIndex - startIndex;
      }
      values.push(new GraphValue(xValue, meanYValues));
    }

    // あとでけす
    values.push(new GraphValue(
        targetValues[targetValues.length - 1].xValue,
        values[values.length - 1].yValues
    ));

    this.graph.show(values);
  }

}

</script>

<style scoped lang="scss">

.graph_root {
  width: 100%;
  height: 100%;
}

</style>
