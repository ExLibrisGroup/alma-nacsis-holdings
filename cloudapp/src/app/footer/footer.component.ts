import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      const savedLang = localStorage.getItem('currentLang') || 'jp';
      console.log("savedLang is:", savedLang);
      this.translate.use(savedLang);
  
      if (!localStorage.getItem('currentLang')) {
        localStorage.setItem('currentLang', 'jp');
      }
    }, 200); 
  }
  

  setLang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('currentLang', lang);
  }

}

