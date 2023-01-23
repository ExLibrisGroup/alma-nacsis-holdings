import { Subscription, of, forkJoin} from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CloudAppEventsService, Entity, EntityType, CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { Router } from '@angular/router';
import { IllService,AlmaRecordsResults, IDisplayLines,BaseRecordInfo, AlmaRequestInfo, AlmaRecordInfo,AlmaRecord,AlmaRecordDisplay} from '../../service/ill.service';
import {  catchError, tap } from 'rxjs/operators';
import { AlmaApiService, IntegrationProfile } from '../../service/alma.api.service';
import { TranslateService } from '@ngx-translate/core';
import { AppRoutingState, REQUEST_EXTERNAL_ID, ROUTING_STATE_KEY, LIBRARY_ID_KEY ,LIBRARY_MEMBERINFO_KEY} from '../../service/base.service';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { HoldingsService} from '../../service/holdings.service';
import { MembersService } from '../../service/members.service';

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
  recordInfoList: AlmaRequestInfo[] = new Array();
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
    private membersService: MembersService,
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
      .subscribe( {
        next : integrationProfile => {
            this.integrationProfile = integrationProfile;

          sessionStorage.setItem(LIBRARY_ID_KEY,integrationProfile.libraryID);
          let rawBibs = (pageInfo.entities || []).filter(e => e.type == EntityType.BIB_MMS || e.type == EntityType.BORROWING_REQUEST );
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
               this.recordInfoList = disCards;
               this.setSearchResultsDisplay(this.recordInfoList,"ill");
               this.setMemberInfo(this.integrationProfile.libraryID);
               this.loading = false;
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

  setMemberInfo(fano){
    let obj:[];
    let queryParams = "";
    //TODO: send the DB also
    queryParams = "ID=" + fano;

    try {
      this.loading = true;
      this.membersService.getSearchResultsFromNacsis(queryParams)

      .subscribe({
        next: (nacsisResponse) => {
          if (nacsisResponse.status === this.membersService.OkStatus) {
            obj = this.convertMemberInfo(nacsisResponse, obj);
          } else {
            this.loading = false;
            this.alert.error(nacsisResponse.errorMessage, { keepAfterRouteChange: true });
          }
        },
        error: e => {
          this.loading = false;
          console.log(e.message);
          this.alert.error(e.message, { keepAfterRouteChange: true });
        },
        complete: () => {
          sessionStorage.setItem(LIBRARY_MEMBERINFO_KEY, JSON.stringify(obj));
          this.loading = false;
        }
      });
    } catch (e) {
      this.loading = false;
      this.alert.error(this.translate.instant('General.Errors.generalError'), { keepAfterRouteChange: true });
    }
  }

  convertMemberInfo(header,obj){
    obj = new Array();
    header.records.forEach(record => {
      obj.push(record);
    });
    return obj;
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

  onCloseClick() {
    this.isErrorMessageVisible = false;
  }

  next(){
    sessionStorage.setItem(ROUTING_STATE_KEY, AppRoutingState.ILLBorrowingMainPage);
      this.loading = true;
      sessionStorage.setItem(REQUEST_EXTERNAL_ID, this.selected.record.exrernalId);
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

 private setSearchResultsDisplay(recordInfoList: AlmaRequestInfo[], type: string){
  this.recordsSummaryDisplay = this.almaApiService.setRecordsSummaryDisplay(recordInfoList,type);
  } 

}

