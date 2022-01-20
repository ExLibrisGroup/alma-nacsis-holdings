import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DisplayHoldingResult } from '../../service/holdings.service';
import { MembersService, NacsisMembersRecord } from '../../service/members.service';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NacsisCatalogResults, IDisplayLines } from '../../catalog/results-types/results-common'
import { SearchType, SearchField, FieldSize, FieldName, SelectSearchField, SelectedSearchFieldValues } from '../../user-controls/search-form/search-form-utils';
import { FullViewLink } from '../../user-controls/full-view-display/full-view-display.component';
import { PageEvent } from '@angular/material/paginator';

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
  private nacsisMembersResultList: Array<NacsisMembersRecord> = new Array();
  private members: DisplayHoldingResult[];
  private selectedValues = new SelectedSearchFieldValues();
  private fieldsMap : Map<FieldName ,SearchField> =  new Map();
  private catalogResultsData: NacsisCatalogResults;
  private resultsSummaryDisplay: Array<IDisplayLines>;
  private resultFullDisplay;
  private resultFullLinkDisplay;
  private panelState: boolean = true;
  private numOfResults: number;
  private pageIndex: number = 0;
  private pageSize: number = 20;
  private enableEdit: boolean = true;
  private enableDelete: boolean = false;
  selected: string;

  // Templates
  @ViewChild('notSearched') notSearchedTmpl:TemplateRef<any>;
  @ViewChild('searchResults') searchResultsTmpl:TemplateRef<any>;
  @ViewChild('noResults') noResultsTmpl:TemplateRef<any>;
  @ViewChild('fullRecord') fullRecordTmpl:TemplateRef<any>;
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

  constructor(
    private membersService: MembersService,
    private translate: TranslateService,
    private alert: AlertService,
  ) {
    
  }

  ngOnInit() {
    this.initFieldsMap();
  }

  private setSearchResultsDisplay(){
    this.catalogResultsData = this.membersService.getSearchResults(SearchType.Members);
    this.numOfResults = this.catalogResultsData.getHeader().totalRecords;
    this.resultsSummaryDisplay = new Array();
    this.catalogResultsData.getResults()?.forEach(result=>{
        this.resultsSummaryDisplay.push(result.getSummaryDisplay());
    });    
    this.panelState = false;
    this.resultsTemplateFactory();
  }

  panelOpenState() {
    this.panelState = true;
  }

  panelCloseState() {
    this.panelState = false;
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

  /*Search the members, calling this function from the DOM*/
  public search() : void{
    this.loading = true;
    let queryParams = this.buildQueryUrl();
    this.getSearchResultsFromNacsis(queryParams);
    
  }

  isEmpty(val) {
    return (val === undefined || val == null || val.length <= 0) ? true : false;
  }

  onTitleClick(recordIndex: number) {
    // Clicking on title will open the full view 
    let record = this.resultsSummaryDisplay[recordIndex];
    this.currentResulsTmpl = this.fullRecordTmpl;
    this.resultFullDisplay = record.getFullRecordData().getFullViewDisplay().initContentDisplay();
  }

  onBackFromFullView() {
    this.currentResulsTmpl = this.searchResultsTmpl;
    this.isRightTableOpen = false;
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
}


//TODO: move to util
export enum QueryParams {
  PageIndex = "pageIndex",
  PageSize = "pageSize",
  SearchType = "searchType",
  Databases = "dataBase",
  ID = "ID"
}
