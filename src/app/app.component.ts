import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { HeroComponent } from './components/hero/hero.component';
import { ReelsMarqueeComponent } from './components/reels-marquee/reels-marquee.component';
import { StoriesComponent } from './components/stories/stories.component';
import { PostsComponent } from './components/posts/posts.component';
import { BrandsComponent } from './components/brands/brands.component';
import { AboutComponent } from './components/about/about.component';
import { VideoLightboxComponent } from './components/video-lightbox/video-lightbox.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroComponent,
    ReelsMarqueeComponent,
    StoriesComponent,
    PostsComponent,
    BrandsComponent,
    AboutComponent,
    VideoLightboxComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
