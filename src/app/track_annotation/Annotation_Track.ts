import {Point} from "@/common/interface/Point";

export interface Annotation_Track {
    start: Point;
    end: Point;
    width: number;
}

export module Annotation_TrackUtil {
    export function modelToFileRow(model: Annotation_Track): string {
        return (
            model.start.x + "," +
            model.start.y + "," +
            model.end.x + "," +
            model.end.y + "," +
            model.width
        );
    }

    export function modelsToFile(models: Annotation_Track[]): string {
        return models.map(v => modelToFileRow(v)).join("\n");
    }

    export function rowToModel(row: string): Annotation_Track {
        const values: string[] = row.split(",");
        return {
            start: {
                x: Number(values[0]),
                y: Number(values[1]),
            },
            end: {
                x: Number(values[2]),
                y: Number(values[3]),
            },
            width: Number(values[4])
        }
    }

    export function fileToModels(file: string): Annotation_Track[] {
        const fileRows = file.split("\n");
        return fileRows.map(v => rowToModel(v));
    }
}


