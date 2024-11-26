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
    this.translate.use('jp');
    const savedLang = localStorage.getItem('currentLang') || 'jp';
    this.translate.use(savedLang);

    if (!localStorage.getItem('currentLang')) {
      localStorage.setItem('currentLang', 'jp');
    }
  }

  setLang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('currentLang', lang);
  }

}
