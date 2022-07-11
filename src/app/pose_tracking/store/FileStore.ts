import {Mutation, Action, VuexModule, getModule, Module} from "vuex-module-decorators";
import store from "@/store";

export interface LoadedFiles {
  videoFile: File;
  annotationFiles: File[];
}

function getInitialState(): LoadedFiles {
  return {
    videoFile: new File([], ""),
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

  get isAnnotationFilesSelected(): boolean {
    return this._loadedFiles.annotationFiles.length > 0;
  }

  get annotationFiles(): File[] {
    return this._loadedFiles.annotationFiles;
  }

  @Action
  public setVideoFile(value: File) {
    this.clear();
    this._setVideoFile(value);
  }

  @Mutation
  private _setVideoFile(value: File) {
    this._loadedFiles.videoFile = value;
  }

  @Mutation
  public setAnnotationFiles(value: File[]) {
    this._loadedFiles.annotationFiles = value;
  }

  @Mutation
  private clear() {
    this._loadedFiles = getInitialState();
  }
}

export default getModule(FileStore);
