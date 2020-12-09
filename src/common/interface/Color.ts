export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export module ColorUtil {
  export function rgba(color: Color) {
    return "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")"
  }
}


