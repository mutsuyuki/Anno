<template>

    <div class="header">
        <div class="icon">
            <img :src="require('@/assets/img/icons/home.svg')"/>
        </div>
        <h1>{{text}}</h1>
    </div>


</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';

    @Component({})
    export default class MenuHeader extends Vue {

        @Prop() private text!: string;

    }
</script>

<style scoped lang="scss">

    .header {
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

        h1 {
            margin-left: 12px;
            font-size: 16px;
        }
    }

</style>
