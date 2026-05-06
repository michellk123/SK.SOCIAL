import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs';
import { VideoMeta } from '../../model/video-meta';
import { VideoLightboxService } from '../../services/video-lightbox.service';

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [],
  templateUrl: './stories.component.html',
  styleUrl: './stories.component.scss',
})
export class StoriesComponent implements OnInit {
  stories: VideoMeta[] = [];
  private http = inject(HttpClient);
  private lightbox = inject(VideoLightboxService);

  ngOnInit() {
    this.http.get<VideoMeta[]>('assets/stories/stories.json').pipe(first()).subscribe(data => {
      this.stories = data;
    });
  }

  open(index: number) {
    this.lightbox.open(this.stories, index);
  }
}
