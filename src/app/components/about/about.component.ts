import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  template: `
  <div class="profile">
    <div class="text">
      <p>My name is Vitor, I'm {{ myAge }} year's old.</p>
      <p>
      I like to ride my bike, listen to alternative music, watch documentaries and drink orange juice.</p>
      <p>My passion is development. Optimize processes and shortening paths is an art that programming makes possible.</p>
      <p>So in recent years I have developed my skills in typescript and logic. Acting as Front end with Angular and
        currently as Fullstack development at <a target="_blank"
          href="https://github.com/cubonetwork">Cubo.network</a>.
      </p>
      <p class="icons">
        <ng-content>
        </ng-content>
      </p>
      <img class="photo" src="/assets/images/perfil.png">
    </div>
  </div>
  `,
  styleUrls: [`./about.component.scss`]
})
export class AboutComponent implements OnInit {
  myAge: number;

  constructor() {
    this.myAge = this.calculateAge();
  }

  ngOnInit(): void {
  }

  calculateAge(bornAt: Date = new Date('04/16/1999')): number {
    const diffMs = Date.now() - bornAt.getTime();
    const ageDt = new Date(diffMs);

    return Math.abs(ageDt.getUTCFullYear() - 1970);
  }
}
