import { LocalStorageService } from './services/local-storage.service';
import { Component } from '@angular/core';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-root',
    template: `
      <div [ngClass]="{'container': true, 'dark-theme': darkTheme, 'light-theme': !darkTheme}">
        <div class="about">
          <app-about>
            <div>
              <button class="menu-item theme-toggler" (click)="toggleTheme()" [ngClass]="{'dark-theme': !darkTheme, 'light-theme': darkTheme}">
                <fa-icon [icon]="lamp" inline="true"></fa-icon>
                <span>{{ darkTheme ? 'dark' : 'light' }} mode </span>
              </button>
            </div>

            <div class="icons">
              <p>
                <a title="GitHub" href="https://github.com/vitorpiovezam" target="_blank"><svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>
                <a title="X (Formely Twitter)" href="https://x.com/vitorpiovezam" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 24 24"><path d="M 2.3671875 3 L 9.4628906 13.140625 L 2.7402344 21 L 5.3808594 21 L 10.644531 14.830078 L 14.960938 21 L 21.871094 21 L 14.449219 10.375 L 20.740234 3 L 18.140625 3 L 13.271484 8.6875 L 9.2988281 3 L 2.3671875 3 z M 6.2070312 5 L 8.2558594 5 L 18.033203 19 L 16.001953 19 L 6.2070312 5 z"></path></svg></a>
                <a title="LinkedIn" href="https://www.linkedin.com/in/vitorpiovezam/" target="_blank" style="top: -2.5px;position: relative;"><svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#0077B5" d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zM5 8H0v16h5V8zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg></a>
                <a title="Strava" href="https://www.strava.com/athletes/35866145" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#FC4C02" d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg></a>
                <a title="Flickr" href="https://www.flickr.com/people/seu_usuario" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="6.5" cy="12" r="4.5" fill="#0063dc"/><circle cx="17.5" cy="12" r="4.5" fill="#ff0084"/></svg></a>
              </p>
            </div>
          </app-about>
        </div>

        <div class="posts">
          <app-post-list></app-post-list>
        </div>

        <div class="post">
          <app-post-view></app-post-view>
        </div>
    </div>
  `,
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  title = 'vitor-js';
  darkTheme = this.localStorageService.has('darkTheme');
  lamp = faLightbulb;
  
  constructor(private localStorageService: LocalStorageService) { 
    document.querySelector('body').style.backgroundColor = this.darkTheme ? '#1d1d1d' : 'white';
  }

  toggleTheme() {
    this.darkTheme = !this.darkTheme;

    this.darkTheme ? this.localStorageService.set('darkTheme', true) : this.localStorageService.remove('darkTheme');
    document.querySelector('body').style.backgroundColor = this.darkTheme ? '#1d1d1d' : 'white';
  }
}
