import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CloudAppEventsService, Entity, EntityType } from '@exlibris/exl-cloudapp-angular-lib';
import { Router } from '@angular/router';
import { HoldingsService} from '../../service/holdings.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';


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

  title: string;
  message: string;
  isErrorMessageVisible: boolean = false;

  constructor(
    private eventsService: CloudAppEventsService,
    private router: Router,
    private nacsis: HoldingsService,
    private translate: TranslateService,
    private alert: AlertService

  ) { }

  ngOnInit() {
  
  this.nacsis.clearSessionStorage();

  this.pageLoad$ = this.eventsService.onPageLoad(pageInfo => {
      this.bibs = (pageInfo.entities || []).filter(e => e.type == EntityType.BIB_MMS);
    });
  }

  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  search() {
    if (this.selected) {
      this.loading = true;

      try {
        let bib = this.bibs.filter(bib => bib.id == this.selected);
        this.nacsis.getHoldingsFromNacsis(this.selected, "Mine") .subscribe({
          next: (header) => {
            if (header.status === this.nacsis.OkStatus) {
              this.router.navigate(['/holdings', this.selected, bib[0].description]);
            } else {
                this.alert.error(header.errorMessage, {keepAfterRouteChange:true});  
            }
          },
          error: e => {
            this.loading = false;
            console.log(e.message);
            this.alert.error(e.message, {keepAfterRouteChange:true});
          },
          complete: () => this.loading = false
        });
      } catch (e) {
        this.loading = false;
        console.log(e);
        this.alert.error(this.translate.instant('Errors.generalError'), {keepAfterRouteChange:true});  
      }
    }
  }

  onCloseClick() {
    this.isErrorMessageVisible = false;
  }
}
