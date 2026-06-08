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
  menuOpen = false;

  readonly nav: NavItem[] = [
    { id: 'our-reels', label: 'REELS' },
    { id: 'stories',   label: 'STORIES' },
    { id: 'posts',     label: 'POSTS' },
    { id: 'brands',    label: 'BRANDS' },
    { id: 'about',     label: 'ABOUT' },
    { id: 'contact',   label: 'CONTACT' },
  ];

  private observer?: IntersectionObserver;
  private intersecting = new Map<string, number>();
  private navigating = false;
  private navigatingTimer: ReturnType<typeof setTimeout> | undefined;

  ngOnInit() {
    requestAnimationFrame(() => this.observeSections());
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    document.body.style.overflow = '';
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 60;
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.menuOpen) this.closeMenu();
  }

  toggleMenu() {
    if (this.menuOpen) {
      this.closeMenu();
    } else {
      this.menuOpen = true;
      document.body.style.overflow = 'hidden';
    }
  }

  closeMenu() {
    this.menuOpen = false;
    document.body.style.overflow = '';
  }

  goTo(event: MouseEvent, id: string) {
    event.preventDefault();
    this.closeMenu();
    const target = document.getElementById(id);
    if (!target) return;

    const header = document.querySelector('header');
    const headerH = header?.getBoundingClientRect().height ?? 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;

    this.activeId = id;
    this.navigating = true;
    clearTimeout(this.navigatingTimer);
    this.navigatingTimer = setTimeout(() => { this.navigating = false; }, 900);

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
        if (this.navigating) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.intersecting.set(entry.target.id, entry.intersectionRatio);
          } else {
            this.intersecting.delete(entry.target.id);
          }
        }
        let topId: string | null = null;
        let topRatio = -1;
        for (const [id, ratio] of this.intersecting) {
          if (ratio > topRatio) { topRatio = ratio; topId = id; }
        }
        this.activeId = topId;
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach(s => this.observer!.observe(s));
  }
}
