import Vue from 'vue'
import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";
import {Frame_Track} from "./FramesStore_Track";
import DeepCloner from "@/common/utils/DeepCloner";

export interface Annotation_Track {
    frame: number;
    objectId: number;
    class: number;
    bounding: {
        left: number,
        top: number
        width: number,
        height: number
    };
    bone: {
        head: { x: number, y: number };
        neck: { x: number, y: number };
        chest: { x: number, y: number };
        left_shoulder: { x: number, y: number };
        left_elbow: { x: number, y: number };
        left_wrist1: { x: number, y: number };
        left_wrist2: { x: number, y: number };
        right_shoulder: { x: number, y: number };
        right_elbow: { x: number, y: number };
        right_wrist1: { x: number, y: number };
        right_wrist2: { x: number, y: number };
        pelvis: { x: number, y: number };
        left_hip: { x: number, y: number };
        left_knee: { x: number, y: number };
        left_ankle1: { x: number, y: number };
        left_ankle2: { x: number, y: number };
        right_hip: { x: number, y: number };
        right_knee: { x: number, y: number };
        right_ankle1: { x: number, y: number };
        right_ankle2: { x: number, y: number };
    };
}


function makeAnnotationInstance(frame: number, objectId: number): Annotation_Track {
    return {
        frame: frame,
        objectId: objectId,
        class: -9999,
        bounding: {
            left: 0.2,
            top: 0.2,
            width: 0.,
            height: 0.6
        },
        bone: {
            head: {x: 0.4, y: 0.5},
            neck: {x: 0.45, y: 0.5},
            chest: {x: 0.5, y: 0.5},
            left_shoulder: {x: 0.5, y: 0.55},
            left_elbow: {x: 0.5, y: 0.6},
            left_wrist1: {x: 0.5, y: 0.65},
            left_wrist2: {x: 0.5, y: 0.7},
            right_shoulder: {x: 0.5, y: 0.45},
            right_elbow: {x: 0.5, y: 0.4},
            right_wrist1: {x: 0.5, y: 0.35},
            right_wrist2: {x: 0.5, y: 0.3},
            pelvis: {x: 0.6, y: 0.5},
            left_hip: {x: 0.6, y: 0.55},
            left_knee: {x: 0.6, y: 0.6},
            left_ankle1: {x: 0.6, y: 0.65},
            left_ankle2: {x: 0.6, y: 0.7},
            right_hip: {x: 0.6, y: 0.45},
            right_knee: {x: 0.6, y: 0.4},
            right_ankle1: {x: 0.6, y: 0.35},
            right_ankle2: {x: 0.6, y: 0.3},
        }
    }
}

@Module({
    name: "AnnotationsStore_Track",
    dynamic: true,
    store: store,
    namespaced: true
})

class AnnotationsStore_Track extends VuexModule {

    // states
    private _annotations: { [frame: number]: { [objectId: number]: Annotation_Track } } = {};

    // getters
    get annotations() {
        return this._annotations;
    }

    // get operatingTarget() {
    //     return this._operatingTarget;
    // }


    @Mutation
    public create(frame: number) {
        if (!this._annotations[frame])
            Vue.set(this._annotations, frame, {});

        console.log("anno", DeepCloner.copy(this._annotations));
        const objectIds = Object.values(this._annotations).map(v => Object.keys(v)).flat();
        const numberObjectIds = objectIds.map(v => Number(v));   // keyはnumber型なので本来いらないはずだけど、string型とみなされるので一応数値配列化
        const newId = numberObjectIds.length == 0 ? 0 : numberObjectIds.reduce((a, b) => Math.max(a, b)) + 1;

        Vue.set(this._annotations[frame], newId, makeAnnotationInstance(frame, newId));
    }

}

export default getModule(AnnotationsStore_Track);
