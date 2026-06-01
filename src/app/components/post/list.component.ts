import { Router } from '@angular/router';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import { TranslateService } from 'src/app/services/translate.service';
import { forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';

const TAG_COLORS: Record<string, string> = {
  angular: '#dd0031',
  rxjs: '#b7178c',
  graphql: '#e535ab',
  css: '#264de4',
  testing: '#15a356',
  trekking: '#e67e22',
  personal: '#8e44ad',
};

@Component({
    selector: 'app-post-list',
    template: `
  <section class="newspaper" *ngIf="displayPosts?.length">

    <div class="nyt-grid" [ngClass]="'layout-' + gridLayout">

      <!-- Hero (left column text) -->
      <div class="grid-hero-text" (click)="selectPost(hero.slug)">
        <div class="hero-tags">
          <span class="tag" *ngFor="let tag of hero.tags" [style.background]="tagColor(tag)">{{ tag }}</span>
        </div>
        <h2 class="hero-title">{{ hero.displayTitle || hero.title }}</h2>
        <p class="hero-preview">{{ hero.displayPreview || hero.textPreview }}</p>
        <span class="hero-meta">{{ hero.postDate | date: 'MMMM d, y' }} · {{ readingTime(hero) }} min read</span>
      </div>

      <!-- Hero center image (always rendered for layout; hidden via CSS if no src) -->
      <div class="grid-hero-img" [class.has-img]="hero.firstImage" [class.contain-pad]="imageFits[hero.firstImage]?.pad" (click)="selectPost(hero.slug)">
        <img [src]="hero.firstImage" [alt]="hero.title" loading="lazy"
             [style.object-fit]="imageFits[hero.firstImage]?.fit || 'cover'"
             (load)="onImageLoad($event, hero.firstImage)" />
        <span class="img-caption">{{ hero.displayTitle || hero.title }}</span>
      </div>

      <!-- Side column -->
      <div class="grid-side">
        <a class="side-item" *ngFor="let post of sidePosts; let i = index" (click)="selectPost(post.slug)">
          <div class="side-tags">
            <span class="tag" *ngFor="let tag of post.tags" [style.background]="tagColor(tag)">{{ tag }}</span>
          </div>
          <h3 class="side-title">{{ post.displayTitle || post.title }}</h3>
          <p class="side-preview">{{ post.displayPreview || post.textPreview }}</p>
          <span class="side-meta">{{ post.postDate | date: 'MMM d, y' }}</span>
          <div class="side-rule" *ngIf="i < sidePosts.length - 1"></div>
        </a>
      </div>

      <!-- Bottom row cards -->
      <div class="grid-bottom" *ngIf="bottomPosts.length">
        <div class="bottom-rule-full"></div>
        <div class="bottom-cards">
          <a class="bottom-card" *ngFor="let post of bottomPosts; let i = index" (click)="selectPost(post.slug)">
            <div class="bottom-card-img" *ngIf="post.firstImage" [class.contain-pad]="imageFits[post.firstImage]?.pad">
              <img [src]="post.firstImage" [alt]="post.title" loading="lazy"
                   [style.object-fit]="imageFits[post.firstImage]?.fit || 'cover'"
                   (load)="onImageLoad($event, post.firstImage)" />
            </div>
            <div class="bottom-tags">
              <span class="tag" *ngFor="let tag of post.tags" [style.background]="tagColor(tag)">{{ tag }}</span>
            </div>
            <h3 class="bottom-title">{{ post.displayTitle || post.title }}</h3>
            <p class="bottom-preview">{{ post.displayPreview || post.textPreview }}</p>
            <span class="bottom-meta">{{ post.postDate | date: 'MMM d, y' }} · {{ readingTime(post) }} min read</span>
          </a>
        </div>
      </div>
    </div>

  </section>

  <div class="loading-wrap" *ngIf="loading">
    <div class="loading-spinner"></div>
    <p class="loading-text">Loading…</p>
  </div>
  `,
    styleUrls: ['./list.component.scss'],
    standalone: false
})
export class PostListComponent implements OnInit, OnChanges {
  @Input() filterTag = '';
  @Input() lang = 'en';

  posts: Post[] = [];
  displayPosts: Post[] = [];
  hero: Post;
  sidePosts: Post[] = [];
  bottomPosts: Post[] = [];
  loading = true;
  gridLayout = 'a';
  imageFits: Record<string, { fit: 'cover' | 'contain'; pad: boolean }> = {};
  private translating = false;

  constructor(
    private postService: PostService,
    private router: Router,
    private translateService: TranslateService,
  ) { }

  ngOnInit(): void {
    this.postService.getLastPosts().subscribe(posts => {
      this.posts = posts;
      this.applyFilter();
      this.loading = false;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterTag'] && !changes['filterTag'].firstChange) {
      this.applyFilter();
    }
    if (changes['lang'] && !changes['lang'].firstChange) {
      this.translatePosts();
    }
  }

  private applyFilter() {
    let filtered = this.posts;
    if (this.filterTag) {
      filtered = this.posts.filter(p =>
        p.tags?.some(t => t.toLowerCase() === this.filterTag.toLowerCase())
      );
    }
    this.displayPosts = filtered;
    this.distributeGrid();
    if (this.lang !== 'en') {
      this.translatePosts();
    }
  }

  private distributeGrid() {
    if (!this.displayPosts.length) return;
    const total = this.displayPosts.length;

    this.hero = this.displayPosts[0];

    if (total <= 3) {
      this.gridLayout = 'a';
      this.sidePosts = this.displayPosts.slice(1, 3);
      this.bottomPosts = [];
    } else if (total <= 5) {
      this.gridLayout = 'b';
      this.sidePosts = this.displayPosts.slice(1, 3);
      this.bottomPosts = this.displayPosts.slice(3);
    } else {
      this.gridLayout = 'c';
      this.sidePosts = this.displayPosts.slice(1, 4);
      this.bottomPosts = this.displayPosts.slice(4);
    }
  }

  private translatePosts() {
    if (this.translating || this.lang === 'en') {
      if (this.lang === 'en') {
        this.displayPosts.forEach(p => {
          p.displayTitle = undefined;
          p.displayPreview = undefined;
        });
      }
      return;
    }
    this.translating = true;

    const translations = this.displayPosts.map(post =>
      forkJoin([
        this.translateService.translate(post.title, 'en', this.lang),
        this.translateService.translate(post.textPreview, 'en', this.lang),
      ]).pipe(
        map(([title, preview]) => {
          post.displayTitle = title;
          post.displayPreview = preview;
          return post;
        })
      )
    );

    forkJoin(translations).subscribe({
      next: () => { this.translating = false; },
      error: () => { this.translating = false; }
    });
  }

  onImageLoad(event: Event, url: string) {
    if (!url) return;
    const img = event.target as HTMLImageElement;
    const ratio = img.naturalWidth / img.naturalHeight;
    const area = img.naturalWidth * img.naturalHeight;
    const small = area < 120000 || /favicon|icon-|192x192/i.test(url);
    const extreme = ratio > 2.2 || ratio < 0.85;
    const useContain = small || extreme;
    this.imageFits[url] = { fit: useContain ? 'contain' : 'cover', pad: useContain };
  }

  selectPost(slug: string) {
    this.router.navigateByUrl(`post/${slug}`);
  }

  tagColor(tag: string): string {
    return TAG_COLORS[tag.toLowerCase()] || '#0040ff';
  }

  readingTime(post: Post): number {
    if (!post.post) return 1;
    const words = post.post.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }
}

export interface Post {
  slug: string;
  title: string;
  tags: string[];
  type: string;
  post: any;
  textPreview: string;
  firstImage: string;
  postDate: Date;
  displayTitle?: string;
  displayPreview?: string;
}
