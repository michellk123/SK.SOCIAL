import { Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss',
})
export class PostsComponent {
  posts = [
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
    'assets/posts/IMG_5271.jpeg',
  ];
}
