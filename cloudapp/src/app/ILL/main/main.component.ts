import { Subscription, of, forkJoin} from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CloudAppEventsService, Entity, EntityType, CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { Router } from '@angular/router';
import { IllService,AlmaRecordsResults, IDisplayLines,BaseRecordInfo,AlmaRecordInfo,AlmaRecord,AlmaRecordDisplay} from '../../service/ill.service';
import {  catchError, tap } from 'rxjs/operators';
import { AlmaApiService, IntegrationProfile } from '../../service/alma.api.service';
import { TranslateService } from '@ngx-translate/core';
import { AppRoutingState, ROUTING_STATE_KEY } from '../../service/base.service';

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
    private router: Router,
  ) { }

  ngOnInit() {

    sessionStorage.clear();
    this.pageLoad$ = this.eventsService.onPageLoad(pageInfo => { 
      this.loading = true;     

      this.almaApiService.getIntegrationProfile()
        .subscribe(integrationProfile => {
          this.integrationProfile = integrationProfile;    
          let rawBibs = (pageInfo.entities || []).filter(e => e.type == EntityType.BIB_MMS || e.type == EntityType.BORROWING_REQUEST );
          let disCards: AlmaRecordInfo[] = new Array(rawBibs.length);
          
          //var t0 = performance.now();
          forkJoin(rawBibs.map(entity => this.getRecord(entity)))
            .subscribe({
              next: (records: any[]) => {

               // var thttp = performance.now();
                let index: number = 0;

                records.forEach(record => {

                  if(this.illService.isEmpty(record.anies)){
                    this.singleRecordInfo = this.almaApiService.extractDisplayCardInfoFromRequest(record);

                   }else{
                    this.singleRecordInfo = this.almaApiService.extractDisplayCardInfo(record.anies, this.integrationProfile.libraryCode);                 
                  }
                  if (this.singleRecordInfo != null) {                 
                    disCards[index]= this.singleRecordInfo;
                  }
                  index++;
                })
              //  var tparsing = performance.now();
               // console.log("Method 1: call to do http took " + (thttp-t0) + " milliseconds.");
              //  console.log("Method 1: call to do parsing took " + (tparsing-thttp) + " milliseconds.");
              },
              error: e => {
                this.loading = false;
                console.log(e.message);
              },
              complete: () => {
               // var t1 = performance.now();
               // console.log("Method 1: call to do All took " + (t1-t0) + " milliseconds.");
                
               this.loading = false;
               this.recordInfoList = disCards;
               this.setSearchResultsDisplay();
              }
            });


            // let link_start = '/bibs?mms_id=';
            // let mmsidConcat = '';
            // rawBibs.forEach(entity => {
            //   let mmsid = entity.id;
            //   mmsidConcat = mmsidConcat.concat(mmsid) + ',';
            // })
            // mmsidConcat = mmsidConcat.substring(0,mmsidConcat.length -1 );
            // console.log(link_start + mmsidConcat);

            // var t2 = performance.now();
            // this.getRecordByLink(link_start + mmsidConcat).subscribe({
 
            //   error: e => {
            //     console.log(e.message);
            //   },

            //   complete: () => {
            //     var t3 = performance.now();
            //     console.log("Method 2: call to do something took " + (t3-t2) + " milliseconds.");
            //   }
            // });
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

 private setSearchResultsDisplay(){
  this.almaResultsData = new AlmaRecordsResults();
  this.recordInfoList.forEach(record=>{
    this.almaRecord = new AlmaRecord('',this.translate,this.illService);
    this.almaRecord.moduleType = "ill";
    this.illService.recordFillIn(this.almaRecord,record);
    this.baseRecordInfoList.push(this.almaRecord);
  });

  this.almaResultsData.setResults(this.baseRecordInfoList);

  this.recordsSummaryDisplay = new Array();
  this.almaResultsData.getResults()?.forEach(result=>{
    this.recordsSummaryDisplay.push(result.getSummaryDisplay());
});  
}

}

