import DeepCloner from "@/common/utils/DeepCloner";

export default class AnnotationContainer<T> {
    public isSetByFile: boolean = false;
    public isDownloaded: boolean = false;
    public annotation: T;

    constructor(annotation: T) {
        this.annotation = DeepCloner.copy(annotation);
    }
}
