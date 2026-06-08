import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs';
import { VideoMeta } from '../../model/video-meta';
import { VideoLightboxService } from '../../services/video-lightbox.service';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-reels-marquee',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './reels-marquee.component.html',
  styleUrl: './reels-marquee.component.scss',
})
export class ReelsMarqueeComponent implements OnInit, OnDestroy {
  items: VideoMeta[] = [];
  animate = false;
  paused = false;

  private reels: VideoMeta[] = [];
  private http = inject(HttpClient);
  private lightbox = inject(VideoLightboxService);
  private blurHandler = () => (this.paused = true);
  private focusHandler = () => (this.paused = false);

  ngOnInit() {
    this.http.get<VideoMeta[]>('assets/reels/reels.json').pipe(first()).subscribe(reels => {
      this.reels = reels;
      this.items = [...reels, ...reels];
      setTimeout(() => (this.animate = true), 80);
    });
    window.addEventListener('blur', this.blurHandler);
    window.addEventListener('focus', this.focusHandler);
  }

  ngOnDestroy() {
    window.removeEventListener('blur', this.blurHandler);
    window.removeEventListener('focus', this.focusHandler);
  }

  onTrackClick(event: MouseEvent) {
    const btn = (event.target as HTMLElement).closest('[data-video]') as HTMLElement;
    const src = btn?.dataset['video'];
    if (!src) return;
    const index = this.reels.findIndex(r => r.src === src);
    if (index >= 0) this.lightbox.open(this.reels, index);
  }
}
