import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-help',
  template: `
  <div class="cloudapp-actions">
    <button mat-flat-button color="secondary" [routerLink]="['/']">
      {{'General.Back' | translate}}
    </button>
  </div>
  <p translate>Help.Text</p>
  <p><a translate href="https://knowledge.exlibrisgroup.com/Alma/Product_Documentation/010Alma_Online_Help_(English)" target="_blank">Help.OLH</a></p>
  `,
})
export class HelpComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
