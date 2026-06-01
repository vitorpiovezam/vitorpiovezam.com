import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, HostListener, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Post } from './list.component';
import { PostService, Comment } from 'src/app/services/post.service';
import { TranslateService } from 'src/app/services/translate.service';

export const TAG_COLORS: Record<string, string> = {
  angular: '#dd0031',
  rxjs: '#b7178c',
  graphql: '#e535ab',
  css: '#264de4',
  testing: '#15a356',
  trekking: '#e67e22',
  personal: '#8e44ad',
};

@Component({
    selector: 'app-post-view',
    template: `
    <div class="overlay" [class.open]="isOpen" (click)="onOverlayClick($event)">
      <div class="modal" *ngIf="loading || post" (click)="$event.stopPropagation()">

        <div class="progress-track">
          <div class="progress-bar"></div>
        </div>

        <button class="back-btn-floating" *ngIf="!loading && post" (click)="closePost()" aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        <!-- Sticky toolbar — only after inline actions scroll out of view -->
        <div class="article-toolbar pinned" *ngIf="!loading && post && toolbarPinned">
          <ng-container *ngTemplateOutlet="actionsToolbar"></ng-container>
        </div>

        <app-loading *ngIf="loading"></app-loading>

        <ng-template #actionsToolbar>
          <div class="actions-bar">
            <button class="toolbar-btn listen-btn" (click)="toggleListen()" [class.listening]="listening">
              <span class="listen-play-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <polygon *ngIf="!listening" points="5 3 19 12 5 21 5 3"></polygon>
                  <rect *ngIf="listening" x="6" y="5" width="4" height="14"></rect>
                  <rect *ngIf="listening" x="14" y="5" width="4" height="14"></rect>
                </svg>
              </span>
              <span class="listen-label">{{ listening ? 'Stop' : 'Listen · ' + listenDuration }}</span>
            </button>
            <div class="actions-bar-right">
              <button class="toolbar-icon-btn" [class.bookmarked]="isBookmarked" (click)="toggleBookmark()" title="{{ isBookmarked ? 'Saved' : 'Save' }}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path [attr.fill]="isBookmarked ? 'currentColor' : 'none'" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>
              <button class="toolbar-icon-btn" (click)="shareArticle()" title="Share">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </button>
              <button class="toolbar-icon-btn" [class.has-count]="comments.length > 0" (click)="openComments()" title="Comments">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span class="comment-count" *ngIf="comments.length">{{ comments.length }}</span>
              </button>
            </div>
          </div>
        </ng-template>

        <article class="article" *ngIf="!loading && post">
          <header class="article-header">
            <div class="article-tags">
              <span class="chip" *ngFor="let tag of post.tags" [style.background]="tagColor(tag)">{{ tag }}</span>
            </div>
            <h1 class="article-title">{{ displayTitle || post.title }}</h1>
            <div class="article-meta">
              <span>{{ post.postDate | date: 'MMMM d, y' }}</span>
              <span class="meta-sep">·</span>
              <span>{{ readingTime }} min read</span>
            </div>
            <div class="article-rule"></div>
          </header>

          <!-- NYT-style actions below header, before body -->
          <div class="article-actions-inline" #actionsAnchor>
            <ng-container *ngTemplateOutlet="actionsToolbar"></ng-container>
          </div>

          <section class="article-body" [class.speaking]="listening">
            <markdown [data]="displayContent || post.post" ngPreserveWhitespaces></markdown>
          </section>

          <!-- Article footer: see more + actions -->
          <footer class="article-footer">
            <div class="footer-rule"></div>

            <div class="see-more" *ngIf="relatedPosts.length">
              <span class="see-more-label">See more on:</span>
              <span *ngFor="let tag of post.tags">
                <span class="chip" [style.background]="tagColor(tag)">{{ tag }}</span>
              </span>
              <div class="related-list">
                <a class="related-item" *ngFor="let p of relatedPosts" (click)="navigateTo(p.slug)">
                  <span class="chip" [style.background]="tagColor(p.tags[0])">{{ p.tags[0] }}</span>
                  <span class="related-title">{{ p.title }}</span>
                </a>
              </div>
            </div>

            <div class="footer-rule"></div>

            <div class="article-actions-inline footer-actions">
              <ng-container *ngTemplateOutlet="actionsToolbar"></ng-container>
            </div>
            <span class="share-copied" *ngIf="linkCopied">Link copied!</span>
          </footer>
        </article>
      </div>

      <!-- Comments aside panel -->
      <aside class="comments-panel" [class.open]="commentsOpen" (click)="$event.stopPropagation()">
        <div class="comments-panel-inner">
          <div class="comments-panel-header">
            <div>
              <p class="comments-panel-count">{{ comments.length }} comment{{ comments.length !== 1 ? 's' : '' }} on</p>
              <h3 class="comments-panel-title">{{ post?.title }}</h3>
            </div>
            <button class="comments-close-btn" (click)="closeComments()" aria-label="Close comments">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <!-- Inline comment form (like NYT "Share your thoughts...") -->
          <div class="comments-form-area" *ngIf="!commentSubmitted">
            <input class="comment-input" [(ngModel)]="commentAuthor" placeholder="Your name" maxlength="60" />
            <textarea class="comment-textarea" [(ngModel)]="commentText" placeholder="Share your thoughts…" rows="3" maxlength="2000"></textarea>
            <div class="comment-form-footer">
              <button class="comment-submit" (click)="submitComment()" [disabled]="!commentAuthor || !commentText">Post comment</button>
              <button class="comment-cancel" *ngIf="replyingTo" (click)="cancelReply()">Cancel</button>
            </div>
          </div>
          <div class="comment-pending" *ngIf="commentSubmitted">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Your comment is pending approval.
          </div>

          <div class="comments-disclaimer">The Times needs your voice. Comments are moderated for civility.</div>

          <div class="sort-bar">
            <span class="sort-label">Sort by:</span>
            <button class="sort-btn active">Newest</button>
          </div>

          <!-- Comment list -->
          <div class="comments-list">
            <ng-container *ngFor="let c of topLevelComments">
              <div class="comment">
                <div class="comment-avatar" [style.background]="avatarColor(c.author)">{{ c.author[0]?.toUpperCase() }}</div>
                <div class="comment-body">
                  <div class="comment-header">
                    <span class="comment-author">{{ c.author }}</span>
                    <span class="comment-time">{{ timeAgo(c.createdAt) }}</span>
                  </div>
                  <p class="comment-text">{{ c.text }}</p>
                  <div class="comment-actions">
                    <button class="comment-action" (click)="recommend(c)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                      Recommend{{ c.recommends ? ' ' + c.recommends : '' }}
                    </button>
                    <button class="comment-action" (click)="startReply(c)">Reply</button>
                    <span class="comment-ellipsis">···</span>
                  </div>

                  <!-- Reply form -->
                  <div class="reply-form-wrap" *ngIf="replyingTo?.commentId === c.commentId">
                    <input class="comment-input sm" [(ngModel)]="commentAuthor" placeholder="Your name" maxlength="60" />
                    <textarea class="comment-textarea sm" [(ngModel)]="commentText" placeholder="Write a reply…" rows="2" maxlength="1000"></textarea>
                    <div class="comment-form-footer">
                      <button class="comment-submit sm" (click)="submitComment()" [disabled]="!commentAuthor || !commentText">Reply</button>
                      <button class="comment-cancel" (click)="cancelReply()">Cancel</button>
                    </div>
                  </div>

                  <!-- Replies -->
                  <div class="replies" *ngIf="getReplies(c.commentId).length">
                    <div class="comment reply" *ngFor="let r of getReplies(c.commentId)">
                      <div class="comment-avatar sm" [style.background]="avatarColor(r.author)">{{ r.author[0]?.toUpperCase() }}</div>
                      <div class="comment-body">
                        <div class="comment-header">
                          <span class="comment-author">{{ r.author }}</span>
                          <span class="comment-time">{{ timeAgo(r.createdAt) }}</span>
                        </div>
                        <p class="comment-text">{{ r.text }}</p>
                        <div class="comment-actions">
                          <button class="comment-action" (click)="recommend(r)">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/></svg>
                            Recommend{{ r.recommends ? ' ' + r.recommends : '' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="comment-rule"></div>
            </ng-container>

            <div class="no-comments" *ngIf="!topLevelComments.length && !loadingComments">
              <p>No comments yet. Be the first to share your thoughts.</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
    `,
    styleUrls: ['./view.component.scss'],
    standalone: false
})
export class PostViewComponent implements OnInit, OnDestroy, OnChanges, AfterViewChecked {
  @Input() lang = 'en';
  @ViewChild('actionsAnchor') actionsAnchor?: ElementRef<HTMLElement>;

  post: Post;
  loading = false;
  isOpen = false;
  readingTime = 1;
  listenDuration = '1:00';
  displayTitle: string;
  displayContent: string;
  relatedPosts: Post[] = [];

  isBookmarked = false;
  linkCopied = false;
  commentsOpen = false;
  listening = false;
  toolbarPinned = false;

  comments: Comment[] = [];
  loadingComments = false;
  commentAuthor = '';
  commentText = '';
  commentSubmitted = false;
  replyingTo: Comment | null = null;

  private originalOverflow = '';
  private bookmarkKey = '';
  private utterance: SpeechSynthesisUtterance | null = null;
  private actionsObserver: IntersectionObserver | null = null;
  private speechBlocks: { el: HTMLElement; start: number; end: number }[] = [];
  private speechPlainText = '';
  private observerSetup = false;

  constructor(
    private postService: PostService,
    private router: Router,
    private translateService: TranslateService,
  ) { }

  ngOnInit(): void {
    this.router.events.subscribe((val) => {
      const event: any = val;
      if (!(event instanceof NavigationEnd)) return;
      if (String(event.url).includes(`/post/`)) {
        const parts = event.url.split('/');
        this.getPost(parts[parts.length - 1]);
      } else {
        this.close();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lang'] && !changes['lang'].firstChange && this.post) {
      this.translateContent();
    }
  }

  ngAfterViewChecked(): void {
    this.setupActionsObserver();
  }

  ngOnDestroy(): void {
    this.stopSpeech();
    this.disconnectActionsObserver();
    this.restoreScroll();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.commentsOpen) { this.closeComments(); return; }
    if (this.isOpen) this.closePost();
  }

  tagColor(tag: string): string {
    return TAG_COLORS[tag?.toLowerCase()] || '#0040ff';
  }

  avatarColor(name: string): string {
    const colors = ['#dd0031','#b7178c','#e535ab','#264de4','#15a356','#e67e22','#8e44ad','#0040ff'];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
  }

  getPost(id: string) {
    this.loading = true;
    this.stopSpeech();
    this.lockScroll();
    requestAnimationFrame(() => { this.isOpen = true; });

    this.postService.getPostBySlug(id).subscribe(post => {
      this.post = post;
      this.readingTime = this.calcReadingTime(post);
      this.loading = false;
      this.displayTitle = undefined;
      this.displayContent = undefined;
      this.commentSubmitted = false;
      this.replyingTo = null;
      this.commentsOpen = false;
      this.bookmarkKey = `bookmark:${id}`;
      this.isBookmarked = !!localStorage.getItem(this.bookmarkKey);

      this.listenDuration = this.calcListenDuration(post);
      this.observerSetup = false;
      this.toolbarPinned = false;

      if (this.lang !== 'en') this.translateContent();
      this.loadRelated();
      this.loadComments();
      this.scrollModalTop();
      setTimeout(() => this.prepareSpeechBlocks(), 400);
    });
  }

  closePost() {
    this.stopSpeech();
    this.disconnectActionsObserver();
    this.isOpen = false;
    this.commentsOpen = false;
    this.toolbarPinned = false;
    setTimeout(() => {
      this.post = null;
      this.comments = [];
      this.relatedPosts = [];
      this.restoreScroll();
      this.router.navigateByUrl('/');
    }, 300);
  }

  onOverlayClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('overlay')) {
      if (this.commentsOpen) this.closeComments();
      else this.closePost();
    }
  }

  navigateTo(slug: string) {
    this.closePost();
    setTimeout(() => this.router.navigateByUrl(`post/${slug}`), 350);
  }

  // ── Bookmark ──────────────────────────────────────────────────────────────
  toggleBookmark() {
    this.isBookmarked = !this.isBookmarked;
    if (this.isBookmarked) localStorage.setItem(this.bookmarkKey, '1');
    else localStorage.removeItem(this.bookmarkKey);
  }

  // ── Share ─────────────────────────────────────────────────────────────────
  shareArticle() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: this.post.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        this.linkCopied = true;
        setTimeout(() => this.linkCopied = false, 2500);
      });
    }
  }

  // ── TTS / Listen ──────────────────────────────────────────────────────────
  toggleListen() {
    if (this.listening) { this.stopSpeech(); return; }
    if (!('speechSynthesis' in window) || !this.post) return;

    this.prepareSpeechBlocks();
    this.speechPlainText = this.stripForSpeech(this.displayContent || this.post.post);

    this.utterance = new SpeechSynthesisUtterance(this.speechPlainText);
    const speechLang = this.lang === 'pt' ? 'pt-BR' : 'en-US';
    this.utterance.lang = speechLang;
    this.utterance.rate = 0.92;
    this.utterance.pitch = 1.05;
    this.utterance.onboundary = (ev: SpeechSynthesisEvent) => {
      if (ev.charIndex >= 0) this.highlightAtChar(ev.charIndex);
    };
    this.utterance.onend = () => this.stopSpeech();
    this.utterance.onerror = () => this.stopSpeech();

    this.startSpeech(speechLang);
    this.listening = true;
  }

  /** Uses the browser Web Speech API (no external service). Prefers a female voice when available. */
  private startSpeech(lang: string) {
    const speak = () => {
      const voice = this.pickPreferredVoice(lang);
      if (voice) this.utterance.voice = voice;
      window.speechSynthesis.speak(this.utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      speak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        speak();
      };
    }
  }

  private pickPreferredVoice(lang: string): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const prefix = lang.startsWith('pt') ? 'pt' : 'en';
    const inLang = voices.filter(v => v.lang.toLowerCase().startsWith(prefix));
    const pool = inLang.length ? inLang : voices;

    const femaleHint = /female|woman|feminina|luciana|francisca|samantha|victoria|karen|moira|fiona|zira|helena|maria|google português|microsoft (.* )?heloisa/i;
    const maleHint = /\bmale\b|\. david|\. mark|\. james|\. daniel|\. richard|\. tom\b|\. alex\b|\. fred\b/i;

    const female = pool.find(v => femaleHint.test(v.name));
    if (female) return female;

    const notMale = pool.find(v => !maleHint.test(v.name));
    return notMale || pool[0];
  }

  private stopSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    this.listening = false;
    this.clearSpeechHighlight();
  }

  private stripForSpeech(md: string): string {
    return md
      .replace(/<[^>]+>/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private prepareSpeechBlocks() {
    const body = document.querySelector('.article-body');
    if (!body) return;
    this.clearSpeechHighlight();
    const blocks = Array.from(body.querySelectorAll('p, li, h1, h2, h3, h4, blockquote')) as HTMLElement[];
    let offset = 0;
    this.speechBlocks = blocks.map(el => {
      const text = (el.innerText || '').trim();
      const start = offset;
      const end = start + text.length + 1;
      offset = end;
      el.classList.add('speech-block');
      return { el, start, end };
    });
  }

  private highlightAtChar(index: number) {
    this.clearSpeechHighlight();
    const block = this.speechBlocks.find(b => index >= b.start && index < b.end);
    if (block) block.el.classList.add('speech-active');
  }

  private clearSpeechHighlight() {
    document.querySelectorAll('.speech-active').forEach(el => el.classList.remove('speech-active'));
  }

  private setupActionsObserver() {
    if (this.observerSetup || !this.actionsAnchor?.nativeElement || !this.post) return;
    const modal = document.querySelector('.modal');
    if (!modal) return;
    this.observerSetup = true;
    this.actionsObserver = new IntersectionObserver(
      ([entry]) => { this.toolbarPinned = !entry.isIntersecting; },
      { root: modal, threshold: 0, rootMargin: '-56px 0px 0px 0px' }
    );
    this.actionsObserver.observe(this.actionsAnchor.nativeElement);
  }

  private disconnectActionsObserver() {
    this.actionsObserver?.disconnect();
    this.actionsObserver = null;
    this.observerSetup = false;
  }

  private calcListenDuration(post: Post): string {
    const words = this.stripForSpeech(post?.post || '').split(/\s+/).filter(Boolean).length;
    const totalSec = Math.max(60, Math.round((words / 155) * 60));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // ── Comments panel ────────────────────────────────────────────────────────
  openComments() { this.commentsOpen = true; }
  closeComments() { this.commentsOpen = false; }

  get topLevelComments(): Comment[] {
    return this.comments.filter(c => !c.parentId);
  }

  getReplies(parentId: string): Comment[] {
    return this.comments.filter(c => c.parentId === parentId);
  }

  loadComments() {
    if (!this.post) return;
    this.postService.getComments(this.post.slug).subscribe({
      next: c => { this.comments = c || []; },
      error: () => {}
    });
  }

  startReply(comment: Comment) {
    this.replyingTo = comment;
    this.commentAuthor = '';
    this.commentText = '';
    this.commentSubmitted = false;
  }

  cancelReply() {
    this.replyingTo = null;
    this.commentAuthor = '';
    this.commentText = '';
  }

  submitComment() {
    if (!this.commentAuthor.trim() || !this.commentText.trim()) return;
    const parentId = this.replyingTo?.commentId;
    this.postService.postComment(this.post.slug, this.commentAuthor.trim(), this.commentText.trim(), parentId)
      .subscribe({
        next: () => {
          this.commentSubmitted = true;
          this.commentAuthor = '';
          this.commentText = '';
          this.replyingTo = null;
          setTimeout(() => this.loadComments(), 600);
        },
        error: () => {}
      });
  }

  recommend(comment: Comment) {
    comment.recommends = (comment.recommends || 0) + 1;
    this.postService.recommendComment(this.post.slug, comment.commentId).subscribe();
  }

  timeAgo(iso: string): string {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // ── Translation ───────────────────────────────────────────────────────────
  private translateContent() {
    if (!this.post || this.lang === 'en') {
      this.displayTitle = undefined;
      this.displayContent = undefined;
      return;
    }
    this.translateService.translate(this.post.title, 'en', this.lang)
      .subscribe(t => this.displayTitle = t);
    this.translateService.translateMarkdown(this.post.post, 'en', this.lang)
      .subscribe(c => this.displayContent = c);
  }

  // ── Related ───────────────────────────────────────────────────────────────
  private loadRelated() {
    if (!this.post?.tags?.length) return;
    const primaryTag = this.post.tags[0];
    this.postService.getLastPosts().subscribe(posts => {
      this.relatedPosts = posts
        .filter(p => p.slug !== this.post.slug && p.tags?.some(t => t === primaryTag))
        .slice(0, 3);
    });
  }

  private close() {
    this.stopSpeech();
    this.disconnectActionsObserver();
    this.isOpen = false;
    this.post = null;
    this.toolbarPinned = false;
    this.restoreScroll();
  }

  private lockScroll() {
    this.originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  private restoreScroll() {
    document.body.style.overflow = this.originalOverflow || '';
  }

  private scrollModalTop() {
    setTimeout(() => {
      const modal = document.querySelector('.modal');
      if (modal) modal.scrollTop = 0;
    }, 50);
  }

  private calcReadingTime(post: Post): number {
    if (!post?.post) return 1;
    return Math.max(1, Math.ceil(post.post.split(/\s+/).length / 200));
  }
}
