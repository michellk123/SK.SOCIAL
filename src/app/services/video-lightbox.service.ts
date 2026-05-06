import { Injectable } from '@angular/core';
import { VideoMeta } from '../model/video-meta';

@Injectable({ providedIn: 'root' })
export class VideoLightboxService {
  private _lightbox: { open(p: VideoMeta[], i: number): void } | null = null;

  register(lightbox: { open(p: VideoMeta[], i: number): void }) {
    this._lightbox = lightbox;
  }

  open(playlist: VideoMeta[], index: number) {
    this._lightbox?.open(playlist, index);
  }
}
