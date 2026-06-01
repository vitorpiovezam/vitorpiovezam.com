import { LocalStorageService } from './services/local-storage.service';
import { TranslateService } from './services/translate.service';
import { Component } from '@angular/core';
import { faAdjust } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-root',
    template: `
      <div [ngClass]="{'nyt': true, 'dark-theme': darkTheme}">

        <div class="topbar">
          <div class="topbar-inner">
            <nav class="tag-nav">
              <a class="tag-nav-item"
                *ngFor="let tag of allTags"
                [class.active]="!filterSaved && activeTag === tag"
                (click)="filterByTag(tag)">{{ tag }}</a>
              <button
                type="button"
                class="tag-nav-item tag-nav-bookmark"
                [class.active]="filterSaved"
                (click)="toggleSavedFilter()"
                aria-label="Saved articles"
                title="Saved articles">
                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                  <path fill="currentColor" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </nav>
            <div class="topbar-actions">
              <div class="lang-toggle">
                <button [class.active]="lang === 'en'" (click)="setLang('en')">EN</button>
                <button [class.active]="lang === 'pt'" (click)="setLang('pt')">PT</button>
              </div>
              <button class="theme-btn" (click)="toggleTheme()" [attr.aria-label]="darkTheme ? 'Light mode' : 'Dark mode'">
                <fa-icon [icon]="themeIcon" inline="true"></fa-icon>
              </button>
            </div>
          </div>
        </div>

        <main class="content">
          <app-post-list [filterTag]="activeFilterTag" [filterSaved]="filterSaved" [lang]="lang"></app-post-list>
        </main>

        <app-post-view [lang]="lang"></app-post-view>

        <section class="about-section" id="about">
          <div class="about-grid">
            <div class="about-left">
              <h2 class="about-title">About me</h2>
              <div class="about-text">
                <p>My name is Vitor, I'm {{ myAge }} year's old.</p>
                <p>I like to ride my bike, listen to alternative music, watch documentaries and drink orange juice.</p>
                <p>My passion is development. Optimize processes and shortening paths is an art that programming makes possible.</p>
                <p>So in recent years I have developed my skills in logic, typescript and cloud computing. Acting as Fullstack Angular/Node, currently as Senior Software Engineer at <a target="_blank" href="https://sciensa.ai/pt">Sciensa AI</a>.</p>
              </div>

              <div class="about-photo">
                <img src="/assets/images/perfil.jpg" alt="Vitor Piovezam" />
              </div>

              <div class="about-social">
                <a href="https://github.com/vitorpiovezam" target="_blank" class="social-link">
                  <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  <div class="social-text">
                    <span class="social-name">GitHub</span>
                    <span class="social-sub">See my projects</span>
                  </div>
                </a>
                <a href="https://www.linkedin.com/in/vitorpiovezam/" target="_blank" class="social-link">
                  <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  <div class="social-text">
                    <span class="social-name">LinkedIn</span>
                    <span class="social-sub">Follow my career</span>
                  </div>
                </a>
                <a href="https://www.flickr.com/people/190210202@N04/" target="_blank" class="social-link">
                  <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M0 12a6 6 0 1012 0A6 6 0 100 12zm12 0a6 6 0 1012 0 6 6 0 10-12 0z"/></svg>
                  <div class="social-text">
                    <span class="social-name">Flickr</span>
                    <span class="social-sub">See my photos with original quality</span>
                  </div>
                </a>
              </div>
            </div>

            <div class="about-right" aria-hidden="true"></div>
          </div>
        </section>

        <footer class="footer">
          <div class="footer-inner">
            <div class="footer-rule"></div>
            <p class="footer-copy">&copy; {{ currentYear }} Vitor Piovezam</p>
          </div>
        </footer>
      </div>
    `,
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  title = 'vitor-js';
  currentYear = new Date().getFullYear();
  darkTheme = this.localStorageService.has('darkTheme');
  themeIcon = faAdjust;
  activeTag = 'all';
  filterSaved = false;
  lang = 'en';
  myAge: number;

  allTags = ['all', 'angular', 'rxjs', 'graphql', 'css', 'testing', 'trekking', 'personal'];

  get activeFilterTag(): string {
    return this.activeTag === 'all' ? '' : this.activeTag;
  }

  constructor(
    private localStorageService: LocalStorageService,
    private translateService: TranslateService,
  ) {
    this.applyBackground();
    this.myAge = this.calculateAge();
  }

  toggleTheme() {
    this.darkTheme = !this.darkTheme;
    this.darkTheme
      ? this.localStorageService.set('darkTheme', true)
      : this.localStorageService.remove('darkTheme');
    this.applyBackground();
  }

  filterByTag(tag: string) {
    this.filterSaved = false;
    this.activeTag = tag;
  }

  toggleSavedFilter() {
    this.filterSaved = !this.filterSaved;
    if (this.filterSaved) {
      this.activeTag = '';
    } else {
      this.activeTag = 'all';
    }
  }

  setLang(lang: string) {
    this.lang = lang;
    this.translateService.setLang(lang);
  }

  private applyBackground() {
    document.querySelector('body').style.backgroundColor = this.darkTheme ? '#1a1a1a' : '#fff';
  }

  private calculateAge(bornAt: Date = new Date('04/16/1999')): number {
    const diffMs = Date.now() - bornAt.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  }
}
