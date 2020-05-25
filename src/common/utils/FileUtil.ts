export default class FileUtil {

    public static removeExtension(fileName:string) {
        return fileName.replace(/\.[^\.]+$/g, "");
    }

}



