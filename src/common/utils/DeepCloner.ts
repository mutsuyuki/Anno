export default class DeepCloner {

    public static copy<T>(source: T): T {
        return JSON.parse(JSON.stringify(source));
    }

}



