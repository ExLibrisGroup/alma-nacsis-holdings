import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CloudAppEventsService, Entity, EntityType } from '@exlibris/exl-cloudapp-angular-lib';
import { Router } from '@angular/router';
import { NacsisService, Holding, Header } from '../nacsis.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  private pageLoad$: Subscription;
  bibs: Entity[] = [];
  selected: string;
  loading = false;

  constructor(
    private eventsService: CloudAppEventsService,
    private router: Router,
    private nacsis: NacsisService,
    private toastr: ToastrService,
    private translate: TranslateService

  ) { }

  ngOnInit() {
    this.pageLoad$ = this.eventsService.onPageLoad(pageInfo => {
      this.bibs = (pageInfo.entities || []).filter(e => e.type == EntityType.BIB_MMS);
    });
  }

  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  async search() {
    if (this.selected) {
      this.loading = true;

      try {
        var bib = this.bibs.filter(bib => bib.id == this.selected);
        var header: Header = await this.nacsis.getHoldingResponse(this.selected);

        if (header.status === this.nacsis.OkStatus) {
          this.router.navigate(['/holdings', this.selected, bib[0].description]);
        } else {
          this.toastr.error(header.errorMessage);
        }
      } catch (e) {
        console.log(e.error);
        this.toastr.error(this.translate.instant('Errors.generalError'));
      } finally {
        this.loading = false;
      }
    }
  }
}
