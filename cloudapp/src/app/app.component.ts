import { Component } from '@angular/core';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet><app-footer></app-footer>'
})
export class AppComponent {

  constructor(private appService: AppService) { }

}
