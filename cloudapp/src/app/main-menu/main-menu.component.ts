import { Component, OnInit } from '@angular/core';
import { AppService } from '../service/app.service';
import { CloudAppEventsService } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';


@Component({
    selector: 'app-main-menu',
    templateUrl: './main-menu.component.html',
    styleUrls: ['./main-menu.component.scss']
  })

  export class MainMenuComponent implements OnInit {
    menu : Array<{title:string, text:string, icon:string, link:string}> = this.initMenu();

    constructor(
        private eventsService: CloudAppEventsService,
        private translate: TranslateService,
    ) { }

    ngOnInit() {}
    
    initMenu(): Array<{title:string, text:string, icon:string, link:string}>{
        return new Array(
            {
                title:  'MainMenu.Holdings.Title',
                text:   'MainMenu.Holdings.Text',
                icon:   'uxf-icon uxf-link',
                link:   'holdings'
            },
            {
                title:  'MainMenu.Catalog.Title',
                text:   'MainMenu.Catalog.Text',
                icon:   'uxf-icon uxf-background-color',
                link:   'catalog'
            },
            // {
            //     title:  'Members',
            //     text:   'NACSIS members information management',
            //     icon:   'uxf-icon uxf-switch',
            //     link:   'main'
            // },
            // {
            //     title:  'ILL Borrowing Requests',
            //     text:   'NACSIS borrowing request creation',
            //     icon:   'uxf-icon uxf-external-link',
            //     link:   'main'
            // },
        );
    }

  }