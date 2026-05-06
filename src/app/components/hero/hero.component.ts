import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements OnInit, AfterViewInit {
  @ViewChild('heroVideo') videoRef!: ElementRef<HTMLVideoElement>;
  isMobile = false;

  ngOnInit() {
    this.isMobile = window.innerWidth <= 768;
  }

  ngAfterViewInit() {
    const video = this.videoRef.nativeElement;
    const play = () => {
      video.muted = true;
      video.playsInline = true;
      video.play().catch(() => {});
    };
    if (video.readyState >= 3) {
      play();
    } else {
      video.addEventListener('canplay', function onReady() {
        play();
        video.removeEventListener('canplay', onReady);
      });
    }
  }
}
