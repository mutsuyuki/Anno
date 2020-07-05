import {Point} from "@/common/interface/Point";

export interface Annotation_Track {
    id: number;
    frame: number;

    bounding: {
        left: number,
        top: number
        width: number,
        height: number
    }

    class: number;

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
    }
}

export module AnnotationUtil_Track {
    export function makeInstance(id:number, frame:number): Annotation_Track {
        return {
            id: id,
            frame: frame,

            bounding: {
                left: 0.2,
                top: 0.2,
                width: 0.,
                height: 0.6
            },

            class: -9999,

            bone: {
                head: {x: 0.3, y: 0.5},
                neck: {x: 0.4, y: 0.5},
                chest: {x: 0.5, y: 0.5},
                left_shoulder: {x: 0.5,  y: 0.45},
                left_elbow: {x: 0.5,     y: 0.4},
                left_wrist1: {x: 0.5,    y: 0.35},
                left_wrist2: {x: 0.5,    y: 0.3},
                right_shoulder: {x: 0.5, y: 0.55},
                right_elbow: {x: 0.5,    y: 0.6},
                right_wrist1: {x: 0.5,   y: 0.65},
                right_wrist2: {x: 0.5,   y: 0.7},
                pelvis: {x: 0.7, y: 0.5},
                left_hip: {x: 0.7,      y: 0.45},
                left_knee: {x: 0.7,     y: 0.4},
                left_ankle1: {x: 0.7,   y: 0.35},
                left_ankle2: {x: 0.7,   y: 0.3},
                right_hip: {x: 0.7,     y: 0.55},
                right_knee: {x: 0.7,    y: 0.6},
                right_ankle1: {x: 0.7,  y: 0.65},
                right_ankle2: {x: 0.7,  y: 0.7},
            }
        }
    }
}


