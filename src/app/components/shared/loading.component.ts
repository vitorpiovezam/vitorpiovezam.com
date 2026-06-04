import { Component } from '@angular/core';

@Component({
    selector: 'app-loading',
    template: `
    <div class="skeleton">
      <div class="sk-line sk-cat"></div>
      <div class="sk-line sk-title"></div>
      <div class="sk-line sk-title-short"></div>
      <div class="sk-line sk-meta"></div>
      <div class="sk-rule"></div>
      <div class="sk-line sk-body"></div>
      <div class="sk-line sk-body"></div>
      <div class="sk-line sk-body"></div>
      <div class="sk-line sk-body-short"></div>
      <div class="sk-line sk-body"></div>
      <div class="sk-line sk-body"></div>
      <div class="sk-line sk-body-short"></div>
      <div class="sk-line sk-body"></div>
      <div class="sk-line sk-body"></div>
      <div class="sk-line sk-body-short"></div>
      <div class="sk-line sk-body"></div>
      <div class="sk-line sk-body"></div>
      <div class="sk-line sk-body-short"></div>
      <div class="sk-line sk-body"></div>
      <div class="sk-line sk-body-short"></div>
    </div>
    `,
    styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .skeleton {
      width: 100%;
      padding: 0;
    }

    .sk-line {
      background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s ease-in-out infinite;
      border-radius: 3px;
      margin-bottom: 14px;
    }

    .sk-cat { width: 60px; height: 12px; }
    .sk-title { width: 90%; height: 32px; }
    .sk-title-short { width: 55%; height: 32px; }
    .sk-meta { width: 180px; height: 14px; margin-bottom: 20px; }
    .sk-rule { height: 1px; background: #eee; margin-bottom: 24px; }
    .sk-body { width: 100%; height: 16px; }
    .sk-body-short { width: 70%; height: 16px; }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    :host-context(.dark-theme) {
      .sk-line {
        background: linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%);
        background-size: 200% 100%;
        animation: shimmer 1.4s ease-in-out infinite;
      }
      .sk-rule { background: #333; }
    }
    `],
    standalone: false
})
export class LoadingComponent {
}
