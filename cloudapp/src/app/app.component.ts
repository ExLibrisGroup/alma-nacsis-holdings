import { Component } from '@angular/core';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  template: '<div><router-outlet></router-outlet><app-footer></app-footer></div>'
})
export class AppComponent {

  constructor(private appService: AppService) { }

}
