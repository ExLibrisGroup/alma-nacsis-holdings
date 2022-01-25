import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DisplayHoldingResult } from '../../service/holdings.service';
import { MembersService } from '../../service/members.service';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NacsisCatalogResults, IDisplayLines } from '../../catalog/results-types/results-common'
import { SearchType, SearchField, FieldSize, FieldName, SelectSearchField, SelectedSearchFieldValues, MultiSearchField } from '../../user-controls/search-form/search-form-utils';
import { FullViewLink } from '../../user-controls/full-view-display/full-view-display.component';
import { PageEvent } from '@angular/material/paginator';
import { AlmaApiService } from '../../service/alma.api.service';
//import { MemberSummaryDisplay } from '../../catalog/results-types/member';
import { RecordSelection } from '../../user-controls/result-card/result-card.component';
import { Router } from '@angular/router';
import { MEMBER_RECORD, ROUTING_STATE_KEY, AppRoutingState } from '../../service/base.service';




@Component({
  selector: 'members',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class MembersSearchComponent implements OnInit {
  //basic variable
  private owners: any[];
  private loading : boolean = false;
  private isRightTableOpen: boolean = false;
  private members: DisplayHoldingResult[];
  private selectedValues = new SelectedSearchFieldValues();
  private fieldsMap : Map<FieldName ,SearchField> =  new Map();
  private editFieldsMap : Map<FieldName ,SearchField> =  new Map();
  private catalogResultsData: NacsisCatalogResults;
  private resultsSummaryDisplay: Array<IDisplayLines>;
  private resultFullDisplay;
  private resultFullLinkDisplay;
  private panelState: boolean = true;
  private numOfResults: number;
  private pageIndex: number = 0;
  private pageSize: number = 20;
  //private enableEdit: boolean = true;
  //private enableDelete: boolean = false;
  selected: string;
  isAllRetrieved: boolean = false;
  private fanoId : string;


  // Templates
  @ViewChild('notSearched') notSearchedTmpl:TemplateRef<any>;
  @ViewChild('searchResults') searchResultsTmpl:TemplateRef<any>;
  @ViewChild('noResults') noResultsTmpl:TemplateRef<any>;
  @ViewChild('fullRecord') fullRecordTmpl:TemplateRef<any>;
  @ViewChild('editForm') editFormTmpl:TemplateRef<any>;
  private currentResulsTmpl: TemplateRef<any>;


  /*Initialize all the search values of members search form*/ 
  private initFieldsMap() : void {
    this.fieldsMap.set(FieldName.ID , new SearchField(FieldName.ID, FieldSize.medium)); 
    this.fieldsMap.set(FieldName.NAME , new SearchField(FieldName.NAME, FieldSize.medium));
    this.fieldsMap.set(FieldName.LOC, new SearchField(FieldName.LOC, FieldSize.medium));
    this.fieldsMap.set(FieldName.KENCODE, new SelectSearchField( this.selectedValues.getRegionCodeList(), FieldName.KENCODE, FieldSize.medium)); 
    this.fieldsMap.set(FieldName.SETCODE , new SelectSearchField(this.selectedValues.getEstablisherTypeList(), FieldName.SETCODE, FieldSize.medium));
    this.fieldsMap.set(FieldName.ORGCODE, new SelectSearchField( this.selectedValues.getInstitutionTypeList(), FieldName.ORGCODE, FieldSize.medium));
    this.fieldsMap.set(FieldName.GRPCODE, new SelectSearchField( this.selectedValues.getOffsetChargeList(), FieldName.GRPCODE, FieldSize.medium));
    this.fieldsMap.set(FieldName.CATFLG, new SelectSearchField( this.selectedValues.getILLParticipationTypeList(), FieldName.CATFLG, FieldSize.medium));
    this.fieldsMap.set(FieldName.ILLFLG, new SelectSearchField( this.selectedValues.getILLParticipationTypeList(), FieldName.ILLFLG, FieldSize.medium));
    this.fieldsMap.set(FieldName.STAT, new SelectSearchField( this.selectedValues.getServiceStatusList(), FieldName.STAT, FieldSize.medium));
    this.fieldsMap.set(FieldName.COPYS, new SelectSearchField( this.selectedValues.getCopyServiceTypeList(), FieldName.COPYS, FieldSize.medium));
    this.fieldsMap.set(FieldName.LOANS, new SelectSearchField( this.selectedValues.getLendingServiceTypeList(), FieldName.LOANS, FieldSize.medium));
    this.fieldsMap.set(FieldName.FAXS, new SelectSearchField( this.selectedValues.getFAXServiceTypeList(), FieldName.FAXS, FieldSize.medium));
  }

  /*Get list of all search value, calling this function from the DOM*/
  public getFieldsList() : Array<SearchField> {
    return Array.from(this.fieldsMap.values());
  }  

  /*Initialize all the search values of members search form*/ 
  private initEditFieldsMap(record : IDisplayLines) : void {
    this.editFieldsMap.set(FieldName.ID , new SearchField(FieldName.ID, FieldSize.medium, record.getFullRecordData().fullView.ID, true)); 
    this.editFieldsMap.set(FieldName.NAME , new SearchField(FieldName.NAME, FieldSize.medium, record.getFullRecordData().fullView.NAME, true));
    this.editFieldsMap.set(FieldName.LOC, new SearchField(FieldName.LOC, FieldSize.medium, record.getFullRecordData().fullView.LOC, true));
    this.editFieldsMap.set(FieldName.KENCODE, new SearchField(FieldName.KENCODE, FieldSize.medium, record.getFullRecordData().fullView.KENCODE, true)); 
    this.editFieldsMap.set(FieldName.SETCODE , new SearchField(FieldName.SETCODE, FieldSize.medium, record.getFullRecordData().fullView.SETCODE, true));
    this.editFieldsMap.set(FieldName.ORGCODE, new SearchField(FieldName.ORGCODE, FieldSize.medium, record.getFullRecordData().fullView.ORGCODE, true));
    this.editFieldsMap.set(FieldName.GRPCODE, new SearchField(FieldName.GRPCODE, FieldSize.medium, record.getFullRecordData().fullView.GRPCODE, true));
    this.editFieldsMap.set(FieldName.CATFLG, new SearchField(FieldName.CATFLG, FieldSize.medium, record.getFullRecordData().fullView.CATFLG, true));
    this.editFieldsMap.set(FieldName.ILLFLG, new SearchField(FieldName.ILLFLG, FieldSize.medium, record.getFullRecordData().fullView.ILLFLG, true));
    this.editFieldsMap.set(FieldName.STAT, new SelectSearchField( this.selectedValues.getServiceStatusList(), FieldName.STAT, FieldSize.medium, record.getFullRecordData().fullView.STAT));
    this.editFieldsMap.set(FieldName.COPYS, new SelectSearchField( this.selectedValues.getCopyServiceTypeList(), FieldName.COPYS, FieldSize.medium, record.getFullRecordData().fullView.COPYS));
    this.editFieldsMap.set(FieldName.LOANS, new SelectSearchField( this.selectedValues.getLendingServiceTypeList(), FieldName.LOANS, FieldSize.medium, record.getFullRecordData().fullView.LOANS));
    this.editFieldsMap.set(FieldName.FAXS, new SelectSearchField( this.selectedValues.getFAXServiceTypeList(), FieldName.FAXS, FieldSize.medium, record.getFullRecordData().fullView.FAXS));
    this.editFieldsMap.set(FieldName.CATTEL, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.CATTEL, FieldSize.medium, record.getFullRecordData().fullView.EMAIL)));
    this.editFieldsMap.set(FieldName.CATDEPT, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.CATDEPT, FieldSize.medium, record.getFullRecordData().fullView.POLICY)));
    this.editFieldsMap.set(FieldName.CATFAX, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.CATFAX, FieldSize.medium, record.getFullRecordData().fullView.EMAIL)));
    this.editFieldsMap.set(FieldName.SYSDEPT, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.SYSDEPT, FieldSize.medium, record.getFullRecordData().fullView.POLICY)));
    this.editFieldsMap.set(FieldName.SYSTEL, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.SYSTEL, FieldSize.medium, record.getFullRecordData().fullView.EMAIL)));
    this.editFieldsMap.set(FieldName.SYSFAX, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.SYSFAX, FieldSize.medium, record.getFullRecordData().fullView.POLICY)));
    this.editFieldsMap.set(FieldName.EMAIL, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.EMAIL, FieldSize.medium, record.getFullRecordData().fullView.EMAIL)));
    this.editFieldsMap.set(FieldName.POLICY, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.POLICY, FieldSize.medium, record.getFullRecordData().fullView.POLICY)));


  }

  /*Get list of all search value, calling this function from the DOM*/
  public getEditFieldsList() : Array<SearchField> {
    return Array.from(this.editFieldsMap.values());
  } 
  
  createSearchFieldListbyFormControlValues(key : FieldName, fieldSize : FieldSize, formControlValues) : any[][] {
    let searchFieldsArrary = new Array();
    formControlValues?.forEach(element => {
      searchFieldsArrary.push( new Array(new SearchField(key, FieldSize.medium, element)));
    });
    if(searchFieldsArrary.length < 1) {
      searchFieldsArrary.push (new Array(new SearchField(key, FieldSize.medium, "")));
    } 
    return searchFieldsArrary;
  }

  constructor(
    private membersService: MembersService,
    private translate: TranslateService,
    private alert: AlertService,
    protected almaApiService: AlmaApiService,
    private router: Router,


    
  ) {}

  ngOnInit() {
    this.initFieldsMap();
    //this.backSession = sessionStorage.getItem(ROUTING_STATE_KEY);
  }

  panelOpenState() {
    this.panelState = true;
  }

  panelCloseState() {
    this.panelState = false;
  }

  onActionsClick(selection: RecordSelection) {
    this.currentResulsTmpl = this.editFormTmpl;
    let record = this.resultsSummaryDisplay[selection.recordIndex];  
    this.initEditFieldsMap(record);
    sessionStorage.setItem(MEMBER_RECORD, JSON.stringify(record));
    sessionStorage.setItem(ROUTING_STATE_KEY, AppRoutingState.MembersMainPage);
    this.router.navigate(['editMember']); 

  }

  private setSearchResultsDisplay(){
    this.catalogResultsData = this.membersService.getSearchResults(SearchType.Members);
    this.numOfResults = this.catalogResultsData.getHeader().totalRecords;
    this.resultsSummaryDisplay = new Array();
    this.getFanoId();
    this.catalogResultsData.getResults()?.forEach(result=>{
        let summery = result.getSummaryDisplay()
        /* If the memeber is mine - we can edit it */
        summery.setEnableEdit(result.getSummaryView().ID === this.fanoId);
        this.resultsSummaryDisplay.push(summery);
    });    
    this.panelState = false;
    this.resultsTemplateFactory();
  }

  resultsTemplateFactory() {
    if(this.numOfResults > 0){
        this.currentResulsTmpl = this.searchResultsTmpl;
    } else if(this.numOfResults == 0 || this.numOfResults == null) {
        this.currentResulsTmpl = this.noResultsTmpl;
    } else {
        this.currentResulsTmpl = this.notSearchedTmpl;
    }
}

    /*Pagination*/
    setPageIndexAndSize(urlParams: string) {
      let pageIndexParam = QueryParams.PageIndex + "=";
      let pageSizeParam = "&" + QueryParams.PageSize + "=";
      let searchTypeParam = "&" + QueryParams.SearchType;
      this.pageIndex = Number(urlParams.split(pageIndexParam).pop().split(pageSizeParam)[0]);
      this.pageSize = Number(urlParams.split(pageSizeParam).pop().split(searchTypeParam)[0]);
  }

  onPageAction(pageEvent: PageEvent) {
    let urlParams = this.membersService.getQueryParams(SearchType.Members);
    let newIndexStr = QueryParams.PageIndex + "=" + pageEvent.pageIndex + "&" + QueryParams.PageSize;
    urlParams = urlParams.replace(/pageIndex=.*pageSize/, newIndexStr);
    let newSizeStr = QueryParams.PageSize + "=" + pageEvent.pageSize + "&" + QueryParams.SearchType;
    urlParams = urlParams.replace(/pageSize=.*searchType/, newSizeStr);
    this.getSearchResultsFromNacsis(urlParams);
  }

  getSearchResultsFromNacsis(queryParams:string) {
    try {
      this.loading = true;
      /* Calling Nacsis servlet */
      // this.membersService.getMembersFromNacsis(queryParams)
      this.membersService.getSearchResultsFromNacsis(queryParams)

        .subscribe({
          next: (nacsisResponse) => {
            if (nacsisResponse.status === this.membersService.OkStatus) {
              if (nacsisResponse.totalRecords >= 1) {
                this.setPageIndexAndSize(queryParams);
                this.membersService.setSearchResultsMap(SearchType.Members, nacsisResponse, queryParams);
                this.setSearchResultsDisplay();
              } else {
                this.panelState = false;
                this.numOfResults = 0;
                this.resultsTemplateFactory();
              }
            } else {
                this.alert.error(nacsisResponse.errorMessage, {keepAfterRouteChange:true});  
            }
          },
          error: e => {
            this.loading = false;
            console.log(e.message);
            this.alert.error(e.message, { keepAfterRouteChange: true });
          },
          complete: () => {
            this.loading = false;
          }
        });
    } catch (e) {
      this.loading = false;
      this.alert.error(this.translate.instant('General.Errors.generalError'), { keepAfterRouteChange: true });
    }
  }

  onOwnerSelected() {
    
    sessionStorage.setItem(this.membersService.OwnerKey, this.selected);

   // owner = All, Mine is included in All, therefore, no need to retrieve from nacsis
    // get All only once
    if (this.selected === '1' && !this.isAllRetrieved) {
      this.getFanoId();
      //this.fieldsMap.get(FieldName.ID).getFormControl().setValue(this.fanoId);
      this.search();
    }
   }

  /*Search the members, calling this function from the DOM*/
  public search() : void{
    this.loading = true;
    let queryParams = this.buildQueryUrl();
    this.getSearchResultsFromNacsis(queryParams);
    
  }

  save() {}


  getFanoId() {

    this.almaApiService.getIntegrationProfile()
      .subscribe( {
        next : integrationProfile => {
          this.fanoId =  integrationProfile.libraryID;
          },
          error: e => {
              this.loading = false;
              console.log(e.message);
              this.alert.error(this.translate.instant('General.Errors.generalError'), {keepAfterRouteChange:true});     
            }
        });
}


  // isEmpty(val) {
  //   return (val === undefined || val == null || val.length <= 0) ? true : false;
  // }

  onTitleClick(recordIndex: number) {
    // Click on the title to open the full view mode
    let record = this.resultsSummaryDisplay[recordIndex];
    this.currentResulsTmpl = this.fullRecordTmpl;
    this.resultFullDisplay = record.getFullRecordData().getFullViewDisplay().initContentDisplay();
  }

  onBackFromFullView() {
    this.currentResulsTmpl = this.searchResultsTmpl;
    this.isRightTableOpen = false;
}

onBackFromEditForm() {
  this.currentResulsTmpl = this.searchResultsTmpl;
  //this.isRightTableOpen = false;
}

  onFullViewInternalLinkClick(fullViewLink: FullViewLink) {
    this.loading = true;
      try{
        this.membersService.getSearchResultsFromNacsis(null)
        .subscribe({
            next: (catalogResults) => {
                if (catalogResults.status === this.membersService.OkStatus) {
                  if (catalogResults.totalRecords == 1) {
                    let baseResult = this.membersService.resultsTypeFactory(SearchType.Members, catalogResults.records[0]);
                    this.resultFullLinkDisplay = baseResult.getFullViewDisplay().initContentDisplay();
                    this.isRightTableOpen = true;
                    this.isAllRetrieved = true;
                  } else {
                      this.resultFullLinkDisplay == null;
                      this.isRightTableOpen = false;
                  }
                } else {
                    this.alert.error(catalogResults.errorMessage, {keepAfterRouteChange:true});  
                } },
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
          this.alert.error(this.translate.instant('General.Errors.generalError'), {keepAfterRouteChange:true});      
      }

  }

  onFullViewLinkClose() {
    this.isRightTableOpen = false;
    this.resultFullLinkDisplay = null;
}

  /* Run over all formControl and build the QueryParams for the get request */
  private buildQueryUrl() : string{
    let urlParams : string = "";
    urlParams = urlParams + QueryParams.PageIndex + "=0&" + QueryParams.PageSize + "=20";
    urlParams = urlParams + "&" + QueryParams.SearchType + "=" + SearchType.Members;
    this.fieldsMap.forEach((value, key)=> {
      urlParams =  this.buildParamField(urlParams, key, value);
    });
    return urlParams;
  }

  /*Get the search value from specific searchForm*/
  buildParamField(urlParams : string, fieldName : FieldName, fieldValue : SearchField) {
    let value : string = fieldValue.getFormControl().value;
    if (!this.membersService.isEmpty(value)) {
      let concatValue = "";
      urlParams = urlParams + "&" + fieldName;
      if (fieldValue instanceof SelectSearchField) {
        let valueArr = fieldValue.getFormControl().value;
        valueArr.forEach(value => {
          concatValue = concatValue.concat(value, ',');
        });
      } else {
        concatValue = value;
      }
      urlParams = urlParams + "=" + concatValue;
      if (urlParams.endsWith(",")) {
        urlParams = urlParams.substring(0, urlParams.length - 1);
      }
    }
    return urlParams;
  }

  clear() {
    this.ngOnInit();
    this.members = new Array();
  }

  resultExists() {
    this.numOfResults > 0;
  }

  public ACTIONS_MENU_LIST: string[] = [
    'ILL.Results.Actions.ViewHolding', 'ILL.Results.Actions.ViewMemInfo'
  ];
}


//TODO: move to util
export enum QueryParams {
  PageIndex = "pageIndex",
  PageSize = "pageSize",
  SearchType = "searchType",
  Databases = "dataBase",
  ID = "ID"
}
