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
    class: string;
    bounding: Bounding_Track;
    bone: {
        mouse: Point;
        head: Point;
        cervical_spine: Point;
        left_shoulder: Point;
        left_elbow: Point;
        left_wrist: Point;
        left_finger: Point;
        right_shoulder: Point;
        right_elbow: Point;
        right_wrist: Point;
        right_finger: Point;
        pelvis: Point;
        left_waist: Point;
        left_knee: Point;
        left_heel: Point;
        left_toe: Point;
        right_waist: Point;
        right_knee: Point;
        right_heel: Point;
        right_toe: Point;
    };
    neck_equipment: Bounding_Track;
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
    public setAnnotationsOfFrame(value: { frame: string, data: { [objectId: string]: Annotation_Track } }) {
        if (!this._annotations[value.frame])
            Vue.set(this._annotations, value.frame, {});

        Vue.set(
            this._annotations,
            value.frame,
            value.data
        );
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
            if ((<any>copiedAnnotation.bone)[jointName].x != -9999) {
                (<any>copiedAnnotation.bone)[jointName].x += 0.005;
                (<any>copiedAnnotation.bone)[jointName].y += 0.01;
            }
        }
        if(copiedAnnotation.neck_equipment.left != -9999){
            copiedAnnotation.neck_equipment.left += 0.005;
            copiedAnnotation.neck_equipment.top += 0.01;
        }

        Vue.set(
            this._annotations[value.frame],
            newObjectId,
            copiedAnnotation
        );
    }


    @Mutation
    public rebirthJoint(value: { frame: string, objectId: string }) {
        if (!this._annotations[value.frame]) {
            alert("現在のフレームにはアノテーションがありません");
            return;
        }
        if (!this._annotations[value.frame][value.objectId]) {
            alert("アノテーションが選択されていません。");
            return;
        }

        const defaultBone = makeAnnotationInstance("", "").bone;
        let targetAnnotation = this._annotations[value.frame][value.objectId];
        for (const jointName in targetAnnotation.bone) {
            const joint = (<any>targetAnnotation.bone)[jointName];
            if (joint.x == -9999) {
                const position = PointUtil.add((<any>targetAnnotation.bone)["mouse"], PointUtil.minus((<any>defaultBone)[jointName], defaultBone["mouse"]));
                (<any>targetAnnotation.bone)[jointName] = position;
            }
        }

        Vue.set(
            this._annotations[value.frame],
            value.objectId,
            targetAnnotation
        );
    }


    @Mutation
    public rebirthNeckEquipment(value: { frame: string, objectId: string }) {
        if (!this._annotations[value.frame]) {
            alert("現在のフレームにはアノテーションがありません");
            return;
        }

        let targetAnnotation = this._annotations[value.frame][value.objectId];
        if (!targetAnnotation) {
            alert("アノテーションが選択されていません。");
            return;
        }
        if (targetAnnotation.neck_equipment && targetAnnotation.neck_equipment.left != -9999) {
            alert("首装置のアノテーションは削除されていません");
            return;
        }

        const defaultBone = makeAnnotationInstance("", "").bone;
        if (targetAnnotation.bone.cervical_spine.x != -9999) {
            targetAnnotation.neck_equipment = {
                left: targetAnnotation.bone.cervical_spine.x - 0.015,
                top: targetAnnotation.bone.cervical_spine.y - 0.015,
                width: 0.015 * 2,
                height: 0.015 * 2
            }
        } else {
            targetAnnotation.neck_equipment = DeepCloner.copy(targetAnnotation.bounding);
            targetAnnotation.neck_equipment.width = 0.015 * 2;
            targetAnnotation.neck_equipment.height = 0.015 * 2;
        }

        Vue.set(
            this._annotations[value.frame],
            value.objectId,
            targetAnnotation
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
    public setClass(value: { frame: string, objectId: string, class: string }) {
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
        const currentPosition = (<any>this._annotations[value.frame][value.objectId].bone)[value.jointName];
        if (currentPosition.x == -9999) {
            return;
        }

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
            if (currentPosition.x == -9999) {
                continue;
            }

            Vue.set(
                this._annotations[value.frame][value.objectId].bone,
                jointName,
                PointUtil.add(DeepCloner.copy(currentPosition), DeepCloner.copy(value.moveAmount))
            );
        }
    }

    @Mutation
    public setNeckEquipment(value: { frame: string, objectId: string, bounding: Bounding_Track }) {
        Vue.set(
            this._annotations[value.frame][value.objectId],
            "neck_equipment",
            DeepCloner.copy(value.bounding)
        );
    }


    @Mutation
    public addNeckEquipmentPositions(value: { frame: string, objectId: string, moveAmount: Point }) {
        console.log("111",this._annotations[value.frame][value.objectId].neck_equipment.left);
        if (this._annotations[value.frame][value.objectId].neck_equipment.left == -9999)
            return

        console.log("222",this._annotations[value.frame][value.objectId].neck_equipment.left);
        this._annotations[value.frame][value.objectId].neck_equipment.left += value.moveAmount.x;
        this._annotations[value.frame][value.objectId].neck_equipment.top += value.moveAmount.y;
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
    public deleteNeckEquipment(value: { frame: string, objectId: string }) {
        Vue.set(
            this._annotations[value.frame][value.objectId],
            "neck_equipment",
            {left: -9999, top: -9999, width: 0.015 * 2, height: 0.015 * 2}
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
        class: "0",
        bounding: {
            left: 0.38,
            top: 0.38,
            width: 0.24,
            height: 0.24
        },
        bone: {
            mouse: {x: 0.4, y: 0.4},
            head: {x: 0.45, y: 0.4},
            cervical_spine: {x: 0.5, y: 0.4},
            left_shoulder: {x: 0.5, y: 0.45},
            left_elbow: {x: 0.5, y: 0.5},
            left_wrist: {x: 0.5, y: 0.55},
            left_finger: {x: 0.5, y: 0.6},
            right_shoulder: {x: 0.475, y: 0.45 * 0.95},
            right_elbow: {x: 0.475, y: 0.5 * 0.95},
            right_wrist: {x: 0.475, y: 0.55 * 0.95},
            right_finger: {x: 0.475, y: 0.6 * 0.95},
            pelvis: {x: 0.6, y: 0.4},
            left_waist: {x: 0.6, y: 0.45},
            left_knee: {x: 0.6, y: 0.5},
            left_heel: {x: 0.6, y: 0.55},
            left_toe: {x: 0.6, y: 0.6},
            right_waist: {x: 0.575, y: 0.45 * 0.95},
            right_knee: {x: 0.575, y: 0.5 * 0.95},
            right_heel: {x: 0.575, y: 0.55 * 0.95},
            right_toe: {x: 0.575, y: 0.6 * 0.95},
        },
        neck_equipment: {
            left: 0.5 - 0.015,
            top: 0.4 - 0.015,
            width: 0.015 * 2,
            height: 0.015 * 2
        }
    }
}

function getNewestObjectId(annotations: { [frame: string]: { [objectId: string]: Annotation_Track } }): string {
    const objectIds = Object.values(annotations).map(v => Object.keys(v)).flat();
    const objectIdsAsNumber = objectIds.map(v => Number(v));   // keyはnumber型なので本来いらないはずだけど、string型とみなされるので一応数値配列化
    const newestIdAsNumber = objectIdsAsNumber.length == 0 ? -1 : objectIdsAsNumber.reduce((a, b) => Math.max(a, b));

    return newestIdAsNumber.toString();
}
