import Vue from 'vue'
import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";
import {Point} from "@/common/interface/Point";
import DeepCloner from "@/common/utils/DeepCloner";

export interface Annotation_Track {
    frame: string;
    objectId: string;
    class: number;
    bounding: {
        left: number,
        top: number
        width: number,
        height: number
    };
    bone: {
        head: Point;
        neck: Point;
        chest: Point;
        left_shoulder: Point;
        left_elbow: Point;
        left_wrist1: Point;
        left_wrist2: Point;
        right_shoulder: Point;
        right_elbow: Point;
        right_wrist1: Point;
        right_wrist2: Point;
        pelvis: Point;
        left_hip: Point;
        left_knee: Point;
        left_ankle1: Point;
        left_ankle2: Point;
        right_hip: Point;
        right_knee: Point;
        right_ankle1: Point;
        right_ankle2: Point;
    };
}


@Module({
    name: "AnnotationsStore_Track",
    dynamic: true,
    store: store,
    namespaced: true
})

class AnnotationsStore_Track extends VuexModule {

    // states
    private _annotations: { [frame: string]: { [objectId: string]: Annotation_Track } } = {};

    // getters
    get annotations() {
        return this._annotations;
    }

    get newestObjectId() {
        return getNewestObjectId(this._annotations);
    }

    @Mutation
    public create(frame: string) {
        if (!this._annotations[frame])
            Vue.set(this._annotations, frame, {});

        const newObjectIdAsNumber = Number(getNewestObjectId(this._annotations)) + 1;
        const newObjectId = newObjectIdAsNumber.toString();

        Vue.set(
            this._annotations[frame],
            newObjectIdAsNumber,
            makeAnnotationInstance(frame, newObjectId)
        );
    }

    @Mutation
    public setClass(value: { frame: string, objectId: string, class: number }) {
        Vue.set(
            this._annotations[value.frame][value.objectId],
            "class",
            value.class
        );
    }

    @Mutation
    public setJointPosition(value: { frame: string, objectId: string, jointName: string, position: Point }) {
        Vue.set(
            this._annotations[value.frame][value.objectId].bone,
            value.jointName,
            DeepCloner.copy(value.position)
        );
    }
}

export default getModule(AnnotationsStore_Track);


function makeAnnotationInstance(frame: string, objectId: string): Annotation_Track {
    return {
        frame: frame,
        objectId: objectId,
        class: 0,
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

function getNewestObjectId(annotations: { [frame: string]: { [objectId: string]: Annotation_Track } }): string {
    const objectIds = Object.values(annotations).map(v => Object.keys(v)).flat();
    const objectIdsAsNumber = objectIds.map(v => Number(v));   // keyはnumber型なので本来いらないはずだけど、string型とみなされるので一応数値配列化
    const newObjectIdAsNumber = objectIdsAsNumber.length == 0 ? -1 : objectIdsAsNumber.reduce((a, b) => Math.max(a, b));

    return newObjectIdAsNumber.toString();
}
