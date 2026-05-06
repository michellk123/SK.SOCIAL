import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';

interface NavItem { id: string; label: string; }

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  scrolled = false;
  activeId: string | null = null;
  pulsingId: string | null = null;

  readonly nav: NavItem[] = [
    { id: 'our-reels', label: 'REELS' },
    { id: 'stories',   label: 'STORIES' },
    { id: 'posts',     label: 'POSTS' },
    { id: 'brands',    label: 'BRANDS' },
    { id: 'about',     label: 'ABOUT' },
  ];

  private observer?: IntersectionObserver;

  ngOnInit() {
    requestAnimationFrame(() => this.observeSections());
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 60;
  }

  goTo(event: MouseEvent, id: string) {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;

    const header = document.querySelector('header');
    const headerH = header?.getBoundingClientRect().height ?? 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', `#${id}`);

    this.pulsingId = id;
    setTimeout(() => { if (this.pulsingId === id) this.pulsingId = null; }, 500);
  }

  private observeSections() {
    const sections = this.nav
      .map(n => document.getElementById(n.id))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) this.activeId = visible[0].target.id;
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach(s => this.observer!.observe(s));
  }
}
