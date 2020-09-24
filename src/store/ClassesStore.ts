import Vue from 'vue'
import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store/index";
import {Annotation_Track} from "@/app/track_annotation/store/AnnotationsStore_Track";


@Module({
    name: "ClassesStore",
    dynamic: true,
    store: store,
    namespaced: true
})

class ClassesStore extends VuexModule {

    // states
    private _classes: { [id: string]: string } = {};

    // getters
    get classes() {
        return this._classes;
    }

    get classesArray(): { id: string, text: string }[] {
        const classesArray = Object.entries(this._classes);
        return classesArray.map(v => {
            return {id: v[0], text: v[1]}
        });
    }

    @Mutation
    public addClass(value: { id: string, text: string }) {
        Vue.set(this._classes, value.id, value.text);
    }

    @Mutation
    public addClassByName(name: string) {
        const ids = Object.keys(this._classes).map(v => Number(v));
        const newestId = ids.length == 0 ? -1 : ids.reduce((a, b) => Math.max(a, b));
        const newId = newestId + 1;
        Vue.set(this._classes, newId.toString(), name);
        console.log(this._classes)
    }

    @Mutation
    public removeClass(id: string) {
        Vue.delete(this._classes, id);
    }
}


export default getModule(ClassesStore);
