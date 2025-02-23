import { Router } from '@angular/router';
import { Component, OnInit, HostListener } from '@angular/core';
import { PostService } from 'src/app/services/post.service';

@Component({
    selector: 'app-post-list',
    template: `
  <div class="container">
    <div>
      <h2>My latest posts</h2>
      <small *ngIf="loading">Under Maintence ⛑️</small>
      <main>
        <ul class="posts">
          <li *ngFor="let post of posts">
            <a (click)="selectPost(post.slug)">
              <div class="card">
                <h3>{{ post.title }}</h3>
                <p>{{ post.textPreview }}</p>
                <span class="chip">{{ post.postDate | date: 'mediumDate' }}</span>
                <span class="chip">{{ post.type }}</span>
              </div>
            </a>
          </li>
        </ul>
      </main>
    </div>
  </div>
  `,
    styles: [`


    @media (min-width: 850px) {
      .container {
        padding: 0 10px;
      }
    }

    @media (max-width: 850px) {
      h2 {
        margin-top: 0;
      }
    }

    ul.posts {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .card:hover {
      cursor: pointer;
    }

    .chip {
      padding: 2px 5px;
      color: black;
      background: aquamarine;
      margin-right: 5px;
    }
    `
    ],
    standalone: false
})
export class PostListComponent implements OnInit {
  posts: Post[];
  types: string[] = [];

  selectedPost: Post = null;
  loading = true;

  constructor(
    private postService: PostService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.postService.getLastPosts().subscribe(posts => { 
      this.posts = posts;
      this.loading = false;
      this.types = this.posts.map(post => post.type);
    });
  }

  selectPost(slug: string) {
    this.router.navigateByUrl(`post/${slug}`);
  }
}

export interface Post {
  slug: string;
  title: string;
  type: string;
  post: any;
  postDate: Date;
}
