import Vue from 'vue'
import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";
import {Point, PointUtil} from "@/common/interface/Point";
import DeepCloner from "@/common/utils/DeepCloner";

export interface Bounding_Track {
    left: number,
    top: number
    width: number,
    height: number
}

export interface Annotation_Track {
    frame: string;
    objectId: string;
    class: number;
    bounding: Bounding_Track;
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
    public setAnnotation(value: { [frame: string]: { [objectId: string]: Annotation_Track } }) {
        this._annotations = value;
    }

    @Mutation
    public create(frame: string) {
        if (!this._annotations[frame])
            Vue.set(this._annotations, frame, {});

        const newObjectId = (Number(getNewestObjectId(this._annotations)) + 1).toString();

        Vue.set(
            this._annotations[frame],
            newObjectId,
            makeAnnotationInstance(frame, newObjectId)
        );
    }

    @Mutation
    public copyObject(value: { frame: string, objectId: string }) {
        if (!this._annotations[value.frame]) {
            alert("現在のフレームにはアノテーションがありません");
            return;
        }
        if (!this._annotations[value.frame][value.objectId]) {
            alert("アノテーションが選択されていません。");
            return;
        }

        const newObjectId = (Number(getNewestObjectId(this._annotations)) + 1).toString();
        let copiedAnnotation = DeepCloner.copy(this._annotations[value.frame][value.objectId]);
        copiedAnnotation.objectId = newObjectId;
        copiedAnnotation.bounding.left += 0.005;
        copiedAnnotation.bounding.top += 0.01;
        copiedAnnotation.bounding.width -= 0.0001;   // 小さいものが優先して選ばれるため、コピーしたやつを選ばれやすくする
        for (const jointName in copiedAnnotation.bone) {
            (<any>copiedAnnotation.bone)[jointName].x += 0.005;
            (<any>copiedAnnotation.bone)[jointName].y += 0.01;
        }

        Vue.set(
            this._annotations[value.frame],
            newObjectId,
            copiedAnnotation
        );
    }

    @Mutation
    public copyPrevFrameObjects(currentFrame: string) {
        const currentFrameAsNumber = Number(currentFrame);
        const allFrames = Object.keys(this._annotations);
        const prevFrames = allFrames.filter(v => {
            const frameAsNumber = Number(v)
            const objectNumInFrame = Object.keys(this._annotations[v]).length;
            return frameAsNumber < currentFrameAsNumber && objectNumInFrame > 0;
        });
        if (prevFrames.length <= 0) {
            alert("現在フレームより前にアノテーションがありません。");
            return;
        }

        prevFrames.sort((a, b) => {
            const aa = Number(a);
            const bb = Number(b);
            if (aa > bb) return 1;
            if (aa < bb) return -1;
            return 0;
        });

        const prevFrame = prevFrames[prevFrames.length - 1];
        if (!this._annotations[currentFrame])
            Vue.set(this._annotations, currentFrame, {});

        console.log(this._annotations, prevFrame);
        for (const objectId in this._annotations[prevFrame]) {
            let copiedAnnotation = DeepCloner.copy(this._annotations[prevFrame][objectId]);
            copiedAnnotation.frame = currentFrame;
            Vue.set(
                this._annotations[currentFrame],
                objectId,
                copiedAnnotation
            );
        }
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
    public setBounding(value: { frame: string, objectId: string, bounding: Bounding_Track }) {
        Vue.set(
            this._annotations[value.frame][value.objectId],
            "bounding",
            DeepCloner.copy(value.bounding)
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

    @Mutation
    public addJointPositions(value: { frame: string, objectId: string, moveAmount: Point }) {
        for (const jointName in this._annotations[value.frame][value.objectId].bone) {
            const currentPosition = (<any>this._annotations[value.frame][value.objectId].bone)[jointName];
            Vue.set(
                this._annotations[value.frame][value.objectId].bone,
                jointName,
                PointUtil.add(DeepCloner.copy(currentPosition), DeepCloner.copy(value.moveAmount))
            );
        }
    }


    @Mutation
    public deleteObject(value: { frame: string, objectId: string }) {
        Vue.delete(
            this._annotations[value.frame],
            value.objectId
        );
    }


    @Mutation
    public deleteJoint(value: { frame: string, objectId: string, jointName: string }) {
        Vue.set(
            this._annotations[value.frame][value.objectId].bone,
            value.jointName,
            {x: -9999, y: -9999}
        );
    }

    @Mutation
    public clear() {
        this._annotations = {};
    }
}

export default getModule(AnnotationsStore_Track);


function makeAnnotationInstance(frame: string, objectId: string): Annotation_Track {
    return {
        frame: frame,
        objectId: objectId,
        class: 0,
        bounding: {
            left: 0.38,
            top: 0.38,
            width: 0.24,
            height: 0.24
        },
        bone: {
            head: {x: 0.4, y: 0.4},
            neck: {x: 0.45, y: 0.4},
            chest: {x: 0.5, y: 0.4},
            left_shoulder: {x: 0.5, y: 0.45},
            left_elbow: {x: 0.5, y: 0.5},
            left_wrist1: {x: 0.5, y: 0.55},
            left_wrist2: {x: 0.5, y: 0.6},
            right_shoulder: {x: 0.475, y: 0.45 * 0.95},
            right_elbow: {x: 0.475, y: 0.5 * 0.95},
            right_wrist1: {x: 0.475, y: 0.55 * 0.95},
            right_wrist2: {x: 0.475, y: 0.6 * 0.95},
            pelvis: {x: 0.6, y: 0.4},
            left_hip: {x: 0.6, y: 0.45},
            left_knee: {x: 0.6, y: 0.5},
            left_ankle1: {x: 0.6, y: 0.55},
            left_ankle2: {x: 0.6, y: 0.6},
            right_hip: {x: 0.575, y: 0.45 * 0.95},
            right_knee: {x: 0.575, y: 0.5 * 0.95},
            right_ankle1: {x: 0.575, y: 0.55 * 0.95},
            right_ankle2: {x: 0.575, y: 0.6 * 0.95},
        }
    }
}

function getNewestObjectId(annotations: { [frame: string]: { [objectId: string]: Annotation_Track } }): string {
    const objectIds = Object.values(annotations).map(v => Object.keys(v)).flat();
    const objectIdsAsNumber = objectIds.map(v => Number(v));   // keyはnumber型なので本来いらないはずだけど、string型とみなされるので一応数値配列化
    const newObjectIdAsNumber = objectIdsAsNumber.length == 0 ? -1 : objectIdsAsNumber.reduce((a, b) => Math.max(a, b));

    return newObjectIdAsNumber.toString();
}
