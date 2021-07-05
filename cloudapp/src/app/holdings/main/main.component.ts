import { Subscription, of, forkJoin} from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CloudAppEventsService, Entity, EntityType, CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { Router } from '@angular/router';
import { HoldingsService} from '../../service/holdings.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';

import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { AlmaApiService, IntegrationProfile } from '../../service/alma.api.service';



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

  processed = 0;
  integrationProfile: IntegrationProfile;

  constructor(
    private eventsService: CloudAppEventsService,
    private router: Router,
    private nacsis: HoldingsService,
    private translate: TranslateService,
    private alert: AlertService,

    private restService: CloudAppRestService,
    private almaApiService: AlmaApiService,

  ) { }

  ngOnInit() {
  
  this.nacsis.clearSessionStorage();

  this.pageLoad$ = this.eventsService.onPageLoad(pageInfo => {

    this.loading=true;

    this.almaApiService.getIntegrationProfile()
      .subscribe(integrationProfile => this.integrationProfile = integrationProfile);

    let rawBibs = (pageInfo.entities || []).filter(e => e.type == EntityType.BIB_MMS);
    let nacsisBibs: Entity[] = [];

    forkJoin(rawBibs.map(entity => this.getRecord(entity)))
      .subscribe({
        next: (records: any[])=>{

          let index: number=0;

          records.forEach(record=>{
            console.log(record);
            let nacsisId = this.almaApiService.extractNacsisId(record.anies, this.integrationProfile.systemNumberPrefix); 
            if(nacsisId != null) {
              // tweak: override mmsId by nacsisId
              let nacsisBib = rawBibs[index];
              nacsisBib.id = nacsisId;
              nacsisBibs.push(nacsisBib);
            }
            index++;
          })
        },
        error: e => {
          this.loading = false;
          console.log(e.message);
          //this.alert.error(e.message, {keepAfterRouteChange:true});
        },
        complete: () => {
          this.loading=false; 
          this.bibs = nacsisBibs;
        }
      });
    });

  }
  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }
  
  getRecord(entity: Entity) {
    return this.restService.call(entity.link).pipe(
      tap(()=>this.processed++),
      catchError(e => of(e)),
    )
  }

  search() {
    if (this.selected) {
      this.loading = true;

      try {
        let bib = this.bibs.filter(bib => bib.id == this.selected);
        this.nacsis.getHoldingsFromNacsis(this.selected, "Mine")
        .subscribe({
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

