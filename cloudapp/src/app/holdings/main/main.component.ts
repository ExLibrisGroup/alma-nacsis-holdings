import { Subscription, of, forkJoin, concat } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CloudAppEventsService, Entity, EntityType, CloudAppRestService, CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';
import { Router } from '@angular/router';
import { HoldingsService } from '../../service/holdings.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';

import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { AlmaApiService, IntegrationProfile } from '../../service/alma.api.service';
import { AppRoutingState, ROUTING_STATE_KEY, VOLUME_LIST } from '../../service/base.service';

import { IllService,AlmaRecordsResults, IDisplayLines,BaseRecordInfo,AlmaRecordInfo,AlmaRecord,AlmaRecordDisplay, AlmaRequestInfo} from '../../service/ill.service';


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
  recordsSummaryDisplay: Array<IDisplayLines>;
  private almaResultsData: AlmaRecordsResults;
  baseRecordInfoList: Array<BaseRecordInfo> = new Array();
  recordInfoList: AlmaRequestInfo[] = new Array();
  almaRecord: AlmaRecord = new AlmaRecord('',this.translate,this.illService);

  constructor(
    private eventsService: CloudAppEventsService,
    private router: Router,
    private nacsis: HoldingsService,
    private translate: TranslateService,
    private alert: AlertService,

    private restService: CloudAppRestService,
    private almaApiService: AlmaApiService,
    private illService: IllService,
    private storeService: CloudAppStoreService
  ) { }

  ngOnInit() {

 //Clear the store
 concat(
  this.storeService.remove(AppRoutingState.HoldingsMainPage),
  this.storeService.remove(ROUTING_STATE_KEY),
  this.storeService.remove(VOLUME_LIST)
).subscribe();    this.pageLoad$ = this.eventsService.onPageLoad(pageInfo => {

      this.loading = true;
      try{
      this.almaApiService.getIntegrationProfile()
        .subscribe( {
            next : integrationProfile => {
                this.integrationProfile = integrationProfile;

                let rawBibs = (pageInfo.entities || []).filter(e => e.type == EntityType.BIB_MMS);
                let disCards: AlmaRequestInfo[] = new Array(rawBibs.length);     

                forkJoin(rawBibs.map(entity => this.getRecord(entity)))
                    .subscribe({
                        next: (records: any[]) => {
                            disCards = this.almaApiService.getAlmaRecodsInfo(records);
                        },
                        error: e => {
                            this.loading = false;
                            console.log(e.message);
                        },
                        complete: () => {
                            this.loading = false;
                            this.recordInfoList = disCards;
                            this.setSearchResultsDisplay(this.recordInfoList,"holding");
                        }
                    });
            },
            error: e => {
                this.loading = false;
                console.log(e.message);
                this.alert.error(this.translate.instant('General.Errors.generalError'), {keepAfterRouteChange:true});      
            }
        });
      }catch(e) {
        this.loading = false;
        console.log(e);
        this.alert.error(this.translate.instant('General.Errors.generalError'), {keepAfterRouteChange:true});      
      }
    });


  }
  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  getRecord(entity: Entity) {
    return this.restService.call(entity.link).pipe(
      tap(() => this.processed++),
      catchError(e => of(e)),
    )
  }

  search() {
    if (this.selected) {
      this.loading = true;

      try {
        let bib = this.recordInfoList.filter(almaRecord => almaRecord.nacsisId ==this.selected );
        this.nacsis.getHoldingsFromNacsis(this.selected, "Mine")
          .subscribe({
            next: (header) => {
              if (header.status === this.nacsis.OkStatus) {
                concat(
                  this.storeService.set(VOLUME_LIST, bib[0].volumes.join(VOLUME_LIST_SEPARATOR)),
                  this.storeService.set(ROUTING_STATE_KEY, AppRoutingState.HoldingsMainPage)
                ).subscribe();
                this.router.navigate(['/holdings', this.selected, bib[0].title]);
              } else {
                this.alert.error(header.errorMessage, { keepAfterRouteChange: true });
              }
            },
            error: e => {
              this.loading = false;
              console.log(e);
              this.alert.error(e.message, { keepAfterRouteChange: true });
            },
            complete: () => this.loading = false
          });
      } catch (e) {
        this.loading = false;
        console.log(e);
        this.alert.error(this.translate.instant('General.Errors.generalError'), { keepAfterRouteChange: true });
      }
    }
  }

  onCloseClick() {
    this.isErrorMessageVisible = false;
  }

  private setSearchResultsDisplay(recordInfoList: AlmaRequestInfo[], type: string){
    this.recordsSummaryDisplay = this.almaApiService.setRecordsSummaryDisplay(recordInfoList,type);
    } 

    onRadioClick(item : AlmaRecordDisplay) {
      this.selected = item.getNacsisID();
    }

}

export const VOLUME_LIST_SEPARATOR = "(^_^)";