declare module 'three/examples/jsm/loaders/STLLoader.js' {
  import type { BufferGeometry, LoadingManager } from 'three'

  export class STLLoader {
    constructor(manager?: LoadingManager)
    load(
      url: string,
      onLoad: (geometry: BufferGeometry) => void,
      onProgress?: (event: ProgressEvent<EventTarget>) => void,
      onError?: (event: unknown) => void,
    ): void
  }
}
