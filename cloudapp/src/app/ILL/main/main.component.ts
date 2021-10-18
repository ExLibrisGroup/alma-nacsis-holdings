import { Subscription, of, forkJoin} from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CloudAppEventsService, Entity, EntityType, CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { Router } from '@angular/router';
import { IllService,AlmaRecordsResults, IDisplayLines,BaseRecordInfo,AlmaRecordInfo,AlmaRecord,AlmaRecordDisplay} from '../../service/ill.service';
import {  catchError, tap } from 'rxjs/operators';
import { AlmaApiService, IntegrationProfile } from '../../service/alma.api.service';
import { TranslateService } from '@ngx-translate/core';
import { AppRoutingState, ROUTING_STATE_KEY } from '../../service/base.service';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';

@Component({
  selector: 'ILL-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})

export class ILLBorrowingMainComponent implements OnInit, OnDestroy {

  private pageLoad$: Subscription;
  selected: AlmaRecordDisplay;
  loading = false;
  message: string;
  isErrorMessageVisible: boolean = false;
  processed = 0;
  integrationProfile: IntegrationProfile;
  recordInfoList: AlmaRecordInfo[] = new Array();
  recordsSummaryDisplay: Array<IDisplayLines>;
  almaResultsData: AlmaRecordsResults;
  almaRecord: AlmaRecord = new AlmaRecord('',this.translate,this.illService);
  baseRecordInfoList: Array<BaseRecordInfo> = new Array();
  
  singleRecordInfo: AlmaRecordInfo;

  constructor(
    private eventsService: CloudAppEventsService,
    private translate: TranslateService,
    private restService: CloudAppRestService,
    private almaApiService: AlmaApiService,
    private illService: IllService,
    private alert: AlertService,
    private router: Router,
  ) { }

  ngOnInit() {

    sessionStorage.clear();
    this.pageLoad$ = this.eventsService.onPageLoad(pageInfo => { 
      this.loading = true;     
      try{
      this.almaApiService.getIntegrationProfile()
        .subscribe(integrationProfile => {
          this.integrationProfile = integrationProfile;    
          let rawBibs = (pageInfo.entities || []).filter(e => e.type == EntityType.BIB_MMS || e.type == EntityType.BORROWING_REQUEST );
          let disCards: AlmaRecordInfo[] = new Array(rawBibs.length);

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
               this.setSearchResultsDisplay(this.recordInfoList,"ill");
              }
            });
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
      tap(()=>this.processed++),
      catchError(e => of(e)),
    )
  }

  getRecordByLink(link: string) {
    return this.restService.call(link).pipe(
      tap(()=>this.processed++),
      catchError(e => of(e)),
    )
  }


  onCloseClick() {
    this.isErrorMessageVisible = false;
  }

  next(){
    sessionStorage.setItem(ROUTING_STATE_KEY, AppRoutingState.ILLBorrowingMainPage);
      this.loading = true;
      this.illService.setFormValue(this.selected);
      this.router.navigate(['searchRecord',this.selected.record.nacsisId,this.selected.record.title,
                            this.selected.record.isbn,this.selected.record.issn]);
  }

  newSearch(){
    sessionStorage.setItem(ROUTING_STATE_KEY, AppRoutingState.ILLBorrowingMainPage);
    this.router.navigate(['searchRecord']);
  }



  onRadioClick(item : AlmaRecordDisplay) {
    this.selected = item;
 }

 private setSearchResultsDisplay(recordInfoList: AlmaRecordInfo[], type: string){
  this.recordsSummaryDisplay = this.almaApiService.setRecordsSummaryDisplay(recordInfoList,type);
  } 

}

