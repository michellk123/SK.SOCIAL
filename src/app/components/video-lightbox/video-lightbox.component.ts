import { ChangeDetectorRef, Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { VideoLightboxService } from '../../services/video-lightbox.service';
import { VideoMeta } from '../../model/video-meta';

@Component({
  selector: 'app-video-lightbox',
  standalone: true,
  imports: [],
  templateUrl: './video-lightbox.component.html',
  styleUrl: './video-lightbox.component.scss',
})
export class VideoLightboxComponent implements OnInit {
  @ViewChild('player') playerRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('stage') stageRef!: ElementRef<HTMLElement>;

  private svc = inject(VideoLightboxService);
  private cdr = inject(ChangeDetectorRef);

  playlist: VideoMeta[] = [];
  currentIndex = -1;
  visible = false;
  closing = false;
  loading = false;
  switching = false;

  ngOnInit() {
    this.svc.register(this);
  }

  get hasPrev() { return this.currentIndex > 0; }
  get hasNext() { return this.currentIndex < this.playlist.length - 1; }
  get currentPoster() { return this.playlist[this.currentIndex]?.poster ?? null; }
  get counter() {
    return `${String(this.currentIndex + 1).padStart(2, '0')} / ${String(this.playlist.length).padStart(2, '0')}`;
  }

  open(playlist: VideoMeta[], index: number) {
    this.playlist = playlist;
    this.currentIndex = index;
    this.closing = false;
    this.visible = true;
    this.lockScroll();
    // Force Angular to render the @if block so playerRef is available immediately
    this.cdr.detectChanges();
    this.playAt(index);
  }

  close() {
    if (this.closing || !this.visible) return;
    this.closing = true;

    const player = this.playerRef?.nativeElement;
    if (player) {
      try { player.pause(); } catch {}
    }

    const stage = this.stageRef?.nativeElement;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const finish = () => {
      if (player) { player.removeAttribute('src'); player.load(); }
      this.visible = false;
      this.closing = false;
      this.loading = false;
      this.unlockScroll();
    };

    if (reduceMotion || !stage) { finish(); return; }

    const onEnd = (e: AnimationEvent) => {
      if (e.target !== stage) return;
      stage.removeEventListener('animationend', onEnd);
      finish();
    };
    stage.addEventListener('animationend', onEnd);
    setTimeout(() => { if (this.closing) { stage.removeEventListener('animationend', onEnd); finish(); } }, 360);
  }

  prev() {
    if (!this.hasPrev) return;
    this.currentIndex--;
    this.playAt(this.currentIndex);
  }

  next() {
    if (!this.hasNext) return;
    this.currentIndex++;
    this.playAt(this.currentIndex);
  }

  goTo(index: number) {
    if (index === this.currentIndex) return;
    this.currentIndex = index;
    this.playAt(index);
  }

  onBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('lightbox')) this.close();
  }

  onCanPlay() {
    this.loading = false;
    this.switching = false;
    // Retry play in case the initial call in playAt() was rejected
    // (browsers reject play() called right after load() before data is ready)
    if (this.visible && !this.closing) {
      this.playerRef?.nativeElement.play().catch(() => {});
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.visible || this.closing) return;
    if (e.key === 'Escape') { e.preventDefault(); this.close(); }
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key === 'ArrowRight') this.next();
  }

  private prevBodyOverflow = '';
  private prevBodyPaddingRight = '';

  private lockScroll() {
    const sw = window.innerWidth - document.documentElement.clientWidth;
    this.prevBodyOverflow = document.body.style.overflow;
    this.prevBodyPaddingRight = document.body.style.paddingRight;
    if (sw > 0) {
      document.documentElement.style.setProperty('--scrollbar-comp', `${sw}px`);
      document.body.style.paddingRight = `${sw}px`;
    }
    document.body.style.overflow = 'hidden';
  }

  private unlockScroll() {
    document.body.style.overflow = this.prevBodyOverflow;
    document.body.style.paddingRight = this.prevBodyPaddingRight;
    document.documentElement.style.removeProperty('--scrollbar-comp');
  }

  private playAt(index: number) {
    const item = this.playlist[index];
    const player = this.playerRef?.nativeElement;
    if (!item || !player) return;
    this.loading = true;
    this.switching = true;
    player.src = item.src;
    player.load();
    // Triggers buffering beyond preload="metadata"; may be rejected if data
    // isn't ready yet — onCanPlay() retries once the browser signals readiness
    player.play().catch(() => {});
  }
}
