<template>
    <label class="button">
        <div class="title">
            <img :src="iconPath"/>
            <span>{{message}}</span>
        </div>
        <input type="file" class="hidden"
               @change="$emit('change', eventToFiles($event))"
               :accept="accept"
               :multiple="isMultiple ? 'multiple' : ''"/>
    </label>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import InlineSvg from "@/components/InlineSvg";
    import {HTMLElementEvent} from "@/common/interface/HTMLElementEvent";

    @Component({
        components: {
            InlineSvg
        }
    })
    export default class FileSelector extends Vue {

        @Prop() private iconPath!: string;
        @Prop() private message!: string;
        @Prop() private selectedName!: string;
        @Prop() private accept!: string;
        @Prop() private isMultiple!: boolean;


        private eventToFiles(e: HTMLElementEvent<HTMLInputElement>): File[] {
            let files: File[] = [];

            if (!e.target || !e.target.files)
                return files;

            for (let i = 0; i < e.target.files.length; i++) {
                const file = e.target.files[i];
                if (typeof file == "object")
                    files.push(file)
            }
            return files;
        }

    }
</script>

<style scoped lang="scss">
    label {
        display: block;
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
