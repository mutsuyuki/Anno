<template>
  <label class="button">
    <div class="title">
      <img :src="iconPath"/>
      <span>{{ text }}</span>
    </div>
    <input type="file" class="hidden"
           @change="onChange"
           :accept="accept"
           :multiple="isMultiple"
    />
  </label>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import InlineSvg from "@/common/utils/InlineSvg";
import {HTMLElementEvent} from "@/common/interface/HTMLElementEvent";

@Component({
  components: {
    InlineSvg
  }
})
export default class FileSelector extends Vue {
  @Prop() private iconPath!: string;
  @Prop() private text!: string;
  @Prop() private selectedName!: string;
  @Prop() private accept!: string;
  @Prop() private isMultiple!: boolean;

  private onChange(e: HTMLElementEvent<HTMLInputElement>) {
    if (!e.target || !e.target.files) {
      this.$emit("cancel");
      return;
    }

    let files: File[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      if (typeof file == "object")
        files.push(file)
    }

    if (files.length > 0) {
      this.$emit("change", files);
      e.target.value = "";  // クリア
    } else {
      this.$emit("cancel");
    }
  }

}
</script>

<style scoped lang="scss">
label {
  display: block;

  &.button {
    padding: 8px 16px;
  }
}

.title {
  display: flex;
  justify-content: left;
  align-items: center;

  svg {
    width: 16px;
    height: 16px;
  }

  span {
    font-size: 12px;
    color: var(--white);
    margin-left: 8px;
  }
}

input {
  display: none;
}

</style>
