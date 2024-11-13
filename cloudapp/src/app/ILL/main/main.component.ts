import { Subscription, of, forkJoin} from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CloudAppEventsService, Entity, EntityType, CloudAppRestService, CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';
import { Router } from '@angular/router';
import { IllService,AlmaRecordsResults, IDisplayLines,BaseRecordInfo, AlmaRequestInfo, AlmaRecordInfo,AlmaRecord,AlmaRecordDisplay} from '../../service/ill.service';
import { catchError, tap } from 'rxjs/operators';
import { AlmaApiService, IntegrationProfile } from '../../service/alma.api.service';
import { TranslateService } from '@ngx-translate/core';
import { AppRoutingState, REQUEST_EXTERNAL_ID, ROUTING_STATE_KEY, LIBRARY_ID_KEY ,LIBRARY_MEMBERINFO_KEY, SELECTED_INTEGRATION_PROFILE} from '../../service/base.service';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { MembersService } from '../../service/members.service';
import { concat } from 'rxjs';

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
    private storeService: CloudAppStoreService
  ) { }

  ngOnInit() {
 //Clear the store
 concat(
  this.storeService.remove(REQUEST_EXTERNAL_ID),
  this.storeService.remove(LIBRARY_ID_KEY),
  this.storeService.remove(LIBRARY_MEMBERINFO_KEY)
).subscribe();    this.pageLoad$ = this.eventsService.onPageLoad(pageInfo => { 
      this.loading = true;     
      try{
        this.storeService.get(SELECTED_INTEGRATION_PROFILE)
      .subscribe( {
        next : integrationProfile => {
          this.integrationProfile =  JSON.parse(integrationProfile)
          this.storeService.set(LIBRARY_ID_KEY,integrationProfile.libraryID).subscribe();
          let rawBibs = (pageInfo.entities || []).filter(e => e.type == EntityType.BIB_MMS || e.type == EntityType.BORROWING_REQUEST );
          let disCards: AlmaRequestInfo[] = new Array(rawBibs.length);

          forkJoin(rawBibs.map(entity => this.getRecord(entity)))
            .subscribe({
              next: (records: any[]) => {
               disCards = this.almaApiService.getAlmaRecodsInfo(records, this.integrationProfile);
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
          this.storeService.set(LIBRARY_MEMBERINFO_KEY, JSON.stringify(obj)).subscribe();
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
    this.loading = true;
    concat(
      this.storeService.set(ROUTING_STATE_KEY, AppRoutingState.ILLBorrowingMainPage),
     this.storeService.set(REQUEST_EXTERNAL_ID, this.selected.record.exrernalId)
    ).subscribe();
    this.router.navigate(['searchRecord',this.selected.record.nacsisId,this.selected.record.title,
                            this.selected.record.isbn,this.selected.record.issn]);
  }

  newSearch(){
    this.storeService.set(ROUTING_STATE_KEY, AppRoutingState.ILLBorrowingMainPage).subscribe();
    this.router.navigate(['searchRecord']);
  }

viewDrafts(){
    this.storeService.set(ROUTING_STATE_KEY, AppRoutingState.ILLBorrowingMainPage).subscribe();
    this.router.navigate(['searchRecord']);
  }

  onRadioClick(item : AlmaRecordDisplay) {
    this.selected = item;
 }

 private setSearchResultsDisplay(recordInfoList: AlmaRequestInfo[], type: string){
  this.recordsSummaryDisplay = this.almaApiService.setRecordsSummaryDisplay(recordInfoList,type);
  } 

}

