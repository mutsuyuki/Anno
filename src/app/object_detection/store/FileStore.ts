import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";

export interface LoadedFiles {
  videoFile: File;
  imageFiles: File[];
  annotationFiles: File[];
}

function getInitialState(): LoadedFiles {
  return {
    videoFile: new File([], ""),
    imageFiles: [],
    annotationFiles: [],
  }
}

@Module({
  name: "FileStore_" + Math.random().toString(),
  dynamic: true,
  store: store,
  namespaced: true
})

class FileStore extends VuexModule {

  // states
  private _loadedFiles: LoadedFiles = getInitialState();

  // getters
  get loadedFiles(): LoadedFiles {
    return this._loadedFiles;
  }

  get isVideoFileSelected(): boolean {
    return this._loadedFiles.videoFile.name != "";
  }

  get videoUrl(): string {
    return this.isVideoFileSelected ? URL.createObjectURL(this._loadedFiles.videoFile) : "";
  }

  get videoName(): string {
    return this.isVideoFileSelected ? this._loadedFiles.videoFile.name : "";
  }

  get isImageFilesSelected(): boolean {
    return this._loadedFiles.imageFiles.length > 0;
  }

  get imageUrls(): string[] {
    return this._loadedFiles.imageFiles.map(v => URL.createObjectURL(v));
  }

  get imageNames(): string[] {
    return this._loadedFiles.imageFiles.map(v => v.name);
  }

  get isAnnotationFilesSelected(): boolean {
    return this._loadedFiles.annotationFiles.length > 0;
  }

  get annotationFiles(): File[] {
    return this._loadedFiles.annotationFiles;
  }


  @Mutation
  public setVideoFile(value: File) {
    this._loadedFiles.videoFile = value;
  }

  @Mutation
  public setImageFiles(value: File[]) {
    this._loadedFiles.imageFiles = value;
  }

  @Mutation
  public setAnnotationFiles(value: File[]) {
    this._loadedFiles.annotationFiles = value;
  }

  @Mutation
  public clear() {
    this._loadedFiles = getInitialState();
  }
}

export default getModule(FileStore);
