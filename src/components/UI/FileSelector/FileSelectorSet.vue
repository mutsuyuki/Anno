<template>
  <div class="file_selectors">
    <FileSelector
        v-show="useVideoSelector"
        :iconPath="require('@/assets/img/icons/video.svg')"
        :text="'動画を選択'"
        :accept="'video/*'"
        :isMultiple="false"
        @change="$emit('selectVideoFile', $event)"
    />

    <FileSelector
        v-show="useImagesSelector"
        :iconPath="require('@/assets/img/icons/image_multi.svg')"
        :text="'画像を選択'"
        :accept="'image/*'"
        :isMultiple="true"
        @change="$emit('selectImageFiles', $event)"
    />

    <FileSelector
        v-show="useAnnotationSelector"
        :iconPath="require('@/assets/img/icons/text_multi.svg')"
        :text="'教師データを選択'"
        :accept="'application/json'"
        :isMultiple="true"
        @change="$emit('selectAnnotationFiles', $event)"
    />
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import FileSelector from "@/components/UI/FileSelector/FileSelector.vue";

@Component({
  components: {FileSelector}
})
export default class FileSelectorSet extends Vue {
  @Prop({default:false}) private useVideoSelector! :boolean;
  @Prop({default:false}) private useImagesSelector! :boolean;
  @Prop({default:false}) private useAnnotationSelector! :boolean;
}

</script>

<style scoped lang="scss">

.file_selectors {
  *:nth-child(n + 2) {
    margin-top: 8px;
  }
}

</style>
