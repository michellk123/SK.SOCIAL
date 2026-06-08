import { Directive, ElementRef, inject, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appReveal]',
  standalone: true,
  host: { 'class': 'reveal-init' },
})
export class RevealDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  @Input('appReveal') delay: number = 0;

  private observer?: IntersectionObserver;

  ngOnInit() {
    if (this.delay) {
      this.el.nativeElement.style.transitionDelay = `${this.delay}ms`;
    }
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.el.nativeElement.classList.add('revealed');
          this.observer?.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
