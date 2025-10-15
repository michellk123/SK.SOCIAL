import {AfterViewInit, Component, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {filter, first} from 'rxjs';
import {VideoMeta} from './model/video-meta';
import {NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
})
export class AppComponent implements OnInit, AfterViewInit {
  track!: HTMLElement;
  tpl!: HTMLTemplateElement;
  modal!: HTMLDialogElement;
  player!: HTMLVideoElement;
  reels: VideoMeta[] = [];
  stories: VideoMeta[] = [];
  postImageSources: string[] = [];
  brandImageSources: string[] = [];
  isMobile: boolean = false;
  http: HttpClient = inject(HttpClient);
  router: Router = inject(Router);

  ngOnInit(): void {
    this.setPosts();
    this.setBrands();
    this.isMobile = window.innerWidth <= 768;
  }

  private setPosts(): void {
    this.postImageSources = [
      'assets/posts/IMG_5268.png',
      'assets/posts/IMG_5200.PNG',
      'assets/posts/IMG_5197.PNG',
      'assets/posts/IMG_5194.PNG',
      'assets/posts/IMG_5196.PNG',
      'assets/posts/IMG_5184.JPG',
      'assets/posts/IMG_5183.JPG',
      'assets/posts/IMG_5177.JPG',
      'assets/posts/IMG_5178.JPG',
      'assets/posts/IMG_5269.jpeg',
      'assets/posts/IMG_5270.jpeg',
      'assets/posts/IMG_5271.jpeg'
    ];
  }

  private setBrands() {
    this.brandImageSources = [
      'assets/logos/brands/haan.jpeg',
      'assets/logos/brands/makeit.jpeg',
      'assets/logos/brands/vo.jpeg',
      'assets/logos/brands/einav_henna.jpeg',
      'assets/logos/brands/hstern.jpeg',
      'assets/logos/brands/shilat_design.jpeg',
      'assets/logos/brands/sagit_design.jpeg',
    ];
  }

  ngAfterViewInit(): void {
    this.initHTMLElements();
    this.playBestReel();
    this.initReelsMarquee();
    this.initStories();
    this.addKeyBoardEventListeners();
  }

  private initHTMLElements() {
    this.track = document.getElementById('reels-track') as HTMLElement;
    this.tpl = document.getElementById('reel-thumb-template') as HTMLTemplateElement;
    this.modal = document.getElementById('reel-modal') as HTMLDialogElement;
    this.player = document.getElementById('reel-player') as HTMLVideoElement;
  }

  private playBestReel(): void {
    const video = document.getElementById('best-reel') as HTMLVideoElement;
    if (video.readyState >= 3) {
      this.safePlay(video);
      return;
    }
    const onReady = () => {
      this.safePlay(video);
      video.removeEventListener('canplay', onReady);
    };
    video.addEventListener('canplay', onReady);
  }

  private safePlay(video: HTMLVideoElement): void {
    if (!video) return;
    video.muted = true;
    video.playsInline = true;
    video.play();
  }

  private initReelsMarquee() {
    this.http.get<VideoMeta[]>('assets/reels/reels.json').pipe(first()).subscribe(reels => {
      this.reels = reels;
      this.appendThumbs();
      this.appendThumbs();
      this.startMarqueeAnimation();
    });
  }

  private async appendThumbs(): Promise<void> {
    const imageLoaders: Promise<void>[] = [];
    this.reels.forEach((item) => {
      const node = this.tpl.content.firstElementChild!.cloneNode(true) as HTMLElement;
      node.dataset['video'] = item.src;
      const img = node.querySelector('img')!;
      img.src = item.poster;
      img.loading = 'lazy';
      const imgPromise = new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
      imageLoaders.push(imgPromise);
      this.track.appendChild(node);
    });
    await Promise.all(imageLoaders);
  }

  private startMarqueeAnimation(): void {
    this.track.classList.add('animate');
  }

  private initStories() {
    this.http.get<VideoMeta[]>('assets/stories/stories.json').pipe(first()).subscribe(story => {
      this.stories = story;
    });
  }

  private addKeyBoardEventListeners(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.open) this.closeModal();
    });
    window.addEventListener('scroll', () => {
      const header = document.getElementById('page-header');
      if (!header) return;
      if (window.scrollY > 50) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    });
    const marqueeTrack = document.querySelector('.marquee .track') as HTMLElement;
    window.addEventListener('blur', () => (marqueeTrack.style.animationPlayState = 'paused'));
    window.addEventListener('focus', () => (marqueeTrack.style.animationPlayState = 'running'));
  }

  closeModal(): void {
    this.player.pause();
    this.player.removeAttribute('src');
    this.player.load();
    this.modal.close();
  }

  modalDialog(event: MouseEvent): void {
    if (event.target === this.modal) this.closeModal();
  }

  reelThumb(event: MouseEvent): void {
    const btn = (event.target as HTMLElement).closest('.thumb') as HTMLElement;
    if (!btn) return;
    this.player.src = btn.dataset['video']!;
    this.player.currentTime = 0;
    this.modal.showModal();
    this.player.play().catch(() => {});
  }
}
