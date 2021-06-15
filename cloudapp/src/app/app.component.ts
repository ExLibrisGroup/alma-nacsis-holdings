import { Component } from '@angular/core';
import { AppService } from './service/app.service';

@Component({
  selector: 'app-root',
  template: '<div><cloudapp-alert></cloudapp-alert><router-outlet></router-outlet><app-footer></app-footer></div>'
})

export class AppComponent {

  constructor(private appService: AppService) { }

}
