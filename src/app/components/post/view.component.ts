import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, HostListener, ViewEncapsulation } from '@angular/core';
import { Post } from './list.component';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { PostService } from 'src/app/services/post.service';

@Component({
    selector: 'app-post-view',
    template: `
    <app-loading *ngIf="loading"></app-loading>
    <article class="post" *ngIf="!loading && post">
      <h2>{{ post?.title }} <fa-icon [icon]="close" (click)="closePost()"></fa-icon></h2>
      <markdown [data]="post?.post" ngPreserveWhitespaces></markdown>
    </article>

    <a *ngIf="windowScrolled" (click)="scrollUp()">
      <span class="scroller"> <</span>
    </a>
  `,
    styles: [
        `
    article.post {
      width: 100%;
      line-height: 1.8rem;
      transition: all 0.6s;
      user-select: text;

      ::ng-deep pre,code {
        overflow: auto !important;
      }

      fa-icon{
        float: right;
        
        &:hover {
          cursor: pointer;
        }
      }
    }

    fa-icon {
      float: right;
    }

    .scroller {
      position: fixed;
      bottom: 70px;
      right: 70px;
      font-size: 30px;
      transform: rotate(90deg);
    }
    `
    ],
    standalone: false
})
export class PostViewComponent implements OnInit {
  post: Post;
  close = faTimes;
  loading = false;
  windowScrolled = false;

  constructor(
    private postService: PostService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.router.events.subscribe((val) => {
      const event: any = val;
      if (!(event instanceof NavigationEnd)) return;

      if (String(event.url).includes(`/post/`)) {
        const strings = event.url.split('/');
        this.getPost(strings[strings.length-1]);
      }
    });
  }

  getPost(id: string) {
    this.loading = true;
    this.postService.getPostBySlug(id).subscribe(post => {
      this.post = post || post[0];
      this.doFakeLoading();
      this.scrollToPost();
    });
  }
  
  doFakeLoading() {
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  closePost() {
    this.scrollUp();
    setTimeout(() => {
      this.router.navigateByUrl('/');
      this.post = null;
    }, 1000);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.windowScrolled = window.pageYOffset > 800 ? true : false;
  }

  scrollToPost() {
    const width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    if (width > 700) return;

    setTimeout(() => {
      const article: HTMLElement = document.querySelector('article');
      if (article) article.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 1000);
  }

  scrollUp() {
    document.querySelector('.posts').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
