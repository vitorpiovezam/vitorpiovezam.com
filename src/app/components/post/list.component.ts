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
  music: '#1db954',
};

@Component({
    selector: 'app-post-list',
    template: `
  <section class="newspaper" *ngIf="displayPosts?.length">

    <div class="nyt-grid" [ngClass]="'layout-' + gridLayout">

      <!-- Hero (left column text + sub-hero below) -->
      <div class="grid-hero-text">
        <a class="hero-main" (click)="selectPost(hero.slug)">
          <div class="hero-tags">
            <span class="tag" *ngFor="let tag of hero.tags" [style.background]="tagColor(tag)">{{ tag }}</span>
          </div>
          <h2 class="hero-title">{{ hero.displayTitle || hero.title }}</h2>
          <p class="hero-preview">{{ hero.displayPreview || hero.textPreview }}</p>
          <span class="hero-meta">{{ hero.postDate | date: 'MMMM d, y' }} · {{ readingTime(hero) }} min read</span>
        </a>

        <!-- 2nd post below headline -->
        <div class="sub-hero-rule" *ngIf="subHero"></div>
        <a class="sub-hero" *ngIf="subHero" (click)="selectPost(subHero.slug)">
          <!-- mobile-only thumbnail for sub-hero -->
          <div class="side-thumb-mobile" *ngIf="subHero.firstImage" [class.contain-pad]="imageFits[subHero.firstImage]?.pad">
            <img [src]="subHero.firstImage" [alt]="subHero.title" loading="lazy"
                 [style.object-fit]="imageFits[subHero.firstImage]?.fit || 'cover'"
                 (load)="onImageLoad($event, subHero.firstImage)" />
          </div>
          <div class="side-tags">
            <span class="tag" *ngFor="let tag of subHero.tags" [style.background]="tagColor(tag)">{{ tag }}</span>
          </div>
          <h3 class="sub-hero-title">{{ subHero.displayTitle || subHero.title }}</h3>
          <p class="sub-hero-preview">{{ subHero.displayPreview || subHero.textPreview }}</p>
          <span class="hero-meta">{{ subHero.postDate | date: 'MMM d, y' }}</span>
        </a>
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
          <!-- thumbnail: hidden on desktop, shown on mobile -->
          <div class="side-thumb-mobile" *ngIf="post.firstImage" [class.contain-pad]="imageFits[post.firstImage]?.pad">
            <img [src]="post.firstImage" [alt]="post.title" loading="lazy"
                 [style.object-fit]="imageFits[post.firstImage]?.fit || 'cover'"
                 (load)="onImageLoad($event, post.firstImage)" />
          </div>
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

  <div class="empty-saved" *ngIf="!loading && filterSaved && !displayPosts?.length">
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    <p>No saved articles yet. Open a post and tap the bookmark icon to save it here.</p>
  </div>

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
  @Input() filterSaved = false;
  @Input() lang = 'en';
  posts: Post[] = [];
  displayPosts: Post[] = [];
  hero: Post;
  subHero: Post;
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
    if ((changes['filterTag'] || changes['filterSaved']) && this.posts.length) {
      this.applyFilter();
    }
    if (changes['lang'] && !changes['lang'].firstChange) {
      this.translatePosts();
    }
  }

  private applyFilter() {
    let filtered = this.posts;
    if (this.filterSaved) {
      filtered = this.posts.filter(p => !!localStorage.getItem(`bookmark:${p.slug}`));
    } else if (this.filterTag) {
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
    this.subHero = total > 1 ? this.displayPosts[1] : null;
    this.sidePosts = this.displayPosts.slice(2, 5);
    this.bottomPosts = this.displayPosts.slice(5);
    this.gridLayout = total <= 2 ? 'a' : total <= 4 ? 'b' : 'c';
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
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) {
      this.imageFits[url] = { fit: 'cover', pad: false };
      return;
    }
    const ratio = w / h;
    // Use contain when: extreme aspect ratio OR image is small (logo/icon sized)
    // This prevents small logos like RxJS (512×512 but rendered small) from cropping awkwardly
    const isSmall = w < 600 && h < 600;
    const isPng = url.toLowerCase().endsWith('.png') || url.toLowerCase().includes('.png?');
    const extremeRatio = ratio > 3.5 || ratio < 0.3;
    const useContain = extremeRatio || (isSmall && isPng);
    this.imageFits[url] = { fit: useContain ? 'contain' : 'cover', pad: useContain };
  }

  selectPost(slug: string) {
    this.router.navigateByUrl(`post/${slug}`);
  }

  tagColor(tag: string): string {
    return TAG_COLORS[tag.toLowerCase()] || '#5a85d4';
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
