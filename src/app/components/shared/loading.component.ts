import { Component } from '@angular/core';

@Component({
    selector: 'app-loading',
    template: '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>',
    styles: [
        `
    .lds-ring {
      display: inline-block;
      position: relative;
      width: 80px;
      height: 80px;
      left: 50%;
      top: 50%;
    }

    .lds-ring div {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 30px;
      height: 30px;
      margin: 4px;
      border: 4px solid aquamarine;
      border-radius: 50%;
      animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      border-color: aquamarine transparent transparent transparent;
    }

    .lds-ring div:nth-child(1) {
      animation-delay: -0.45s;
    }

    .lds-ring div:nth-child(2) {
      animation-delay: -0.3s;
    }

    .lds-ring div:nth-child(3) {
      animation-delay: -0.15s;
    }

    @keyframes lds-ring {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    `
    ],
    standalone: false
})
export class LoadingComponent {
}
