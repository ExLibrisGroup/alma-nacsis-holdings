import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertService, CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor(
    private translate: TranslateService,
    private storeService: CloudAppStoreService
  ) { }

  ngOnInit() {
    const savedLang = localStorage.getItem('currentLang') || 'jp';
    this.translate.use(savedLang);  
  
    if (!localStorage.getItem('currentLang')) {
      localStorage.setItem('currentLang', 'jp');  
    }
      this.storeService.get('currentLang').subscribe(lang=>{
        if (!lang) {
          this.translate.use('jp');
        } else {
          this.translate.use(lang);
        }
      });
  }
  

  setLang(lang: string) {
    this.translate.use(lang);
    this.storeService.set('currentLang',lang).subscribe();   

  }

}

