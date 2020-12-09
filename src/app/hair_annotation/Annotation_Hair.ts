import {Point} from "@/common/interface/Point";

export interface Annotation_Hair {
  start: Point;
  end: Point;
  width: number;
}

export module Annotation_HairUtil {
  export function modelToFileRow(model: Annotation_Hair): string {
    return (
      model.start.x + "," +
      model.start.y + "," +
      model.end.x + "," +
      model.end.y + "," +
      model.width
    );
  }

  export function modelsToFile(models: Annotation_Hair[]): string {
    return models.map(v => modelToFileRow(v)).join("\n");
  }

  export function rowToModel(row: string): Annotation_Hair {
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

  export function fileToModels(file: string): Annotation_Hair[] {
    const fileRows = file.split("\n");
    return fileRows.map(v => rowToModel(v));
  }
}


