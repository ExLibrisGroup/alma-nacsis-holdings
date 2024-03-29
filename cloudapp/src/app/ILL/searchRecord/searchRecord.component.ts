import { AppRoutingState, ROUTING_STATE_KEY, RESULT_RECORD_LIST_ILL, SELECTED_RECORD_ILL, QueryParams } from '../../service/base.service';
import { Component, AfterViewInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { SearchType, SearchField, FieldSize, FieldName } from '../../user-controls/search-form/search-form-utils';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CatalogService } from '../../service/catalog.service';
import { AlertService, CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { NacsisCatalogResults, IDisplayLines } from '../../catalog/results-types/results-common';
import { IllService, AlmaRecord, AlmaRecordDisplay } from '../../service/ill.service';
import { FullViewLink } from '../../user-controls/full-view-display/full-view-display.component';
import { RecordSelection } from '../../user-controls/selectable-result-card/selectable-result-card.component';
import { MembersService } from '../../service/members.service';
import { concat } from 'rxjs';

@Component({
  selector: 'ILL-searchRecord',
  templateUrl: './searchRecord.component.html',
  styleUrls: ['./searchRecord.component.scss']
})

export class searchRecordComponent implements AfterViewInit, OnDestroy {

  public SEARCH_TYPE_ARRAY = new Array(SearchType.Monographs, SearchType.Serials);
  public ALL_SEARCH_FIELDS_MAP = new Map([
    [SearchType.Monographs, this.initMonographsSearchFields()],
    [SearchType.Serials, this.initSerialsSearchFields()]
  ]);

  public ALL_DATABASES_MAP = new Map([
    [SearchType.Monographs, ['BOOK', 'PREBOOK', 'JPMARC', 'TRCMARC', 'USMARC', 'USMARCX', 'GPOMARC', 'UKMARC', 'REMARC', 'DNMARC', 'CHMARC', 'KORMARC', 'RECON', 'HBZBKS', 'SPABKS', 'ITABKS', 'KERISB', 'KERISX', 'BNFBKS']],
    [SearchType.Serials, ['SERIAL', 'JPMARCS', 'USMARCS', 'SPASER', 'ITASER', 'KERISS', 'BNFSER']],
  ]);

  public ALL_DATABASES_MAP_SEARCH = new Map([
    [SearchType.Monographs, ['BOOK', 'PREBOOK', 'JPMARC', 'TRCMARC', 'USMARC', 'USMARCX', 'GPOMARC', 'UKMARC', 'REMARC', 'DNMARC', 'CHMARC', 'KORMARC', 'RECON', 'HBZBKS', 'SPABKS', 'ITABKS', 'KERISB', 'KERISX', 'BNFBKS']],
    [SearchType.Serials, ['SERIAL', 'JPMARCS', 'USMARCS', 'SPASER', 'ITASER', 'KERISS', 'BNFSER']],
    [SearchType.Names, ['NAME', 'JPMARCA', 'USMARCA']],
    [SearchType.UniformTitles, ['TITLE', 'USMARCT']]
  ]);

  public ACTIONS_MENU_LIST = new Map([
    [SearchType.Monographs, ['Catalog.Results.Actions.View']],
    [SearchType.Serials, ['Catalog.Results.Actions.View']],
  ]);

  backSession;//: AppRoutingState;

  // Selection variables
  public currentSearchType: SearchType = SearchType.Monographs;
  private currentDatabase: string;// = '';  // first default selection (since opened with Monographs)
  selected: IDisplayLines;

  // UI variables
  panelState: boolean = true;
  loading: boolean = false;
  isRightTableOpen: boolean = false;
  isColapsedMode: boolean = true;
  isFirstIndex: number;

  // Search variables
  private catalogResultsData: NacsisCatalogResults;
  numOfResults: number;
  pageIndex: number = 0;
  pageSize: number = 20;

  // Display variables
  resultsSummaryDisplay: Array<IDisplayLines>;
  resultFullDisplay;
  resultFullLinkDisplay;
  public selectedIndexBinding = 0;
  private recordIndexSelected: number;

  private nacsisID: string;
  private title: string;
  private isbn: string;
  private issn: string;
  private itemRecord: AlmaRecord = new AlmaRecord('', this.translate, this.illService);
  private itemRecordDisplay: AlmaRecordDisplay = new AlmaRecordDisplay(this.translate, this.itemRecord, this.illService, 'holding');
  private isBackFromHoldingSearch: string;

  ArrayEntity: Array<string> = new Array();
  processed = 0;

  // Templates
  @ViewChild('notSearched') notSearchedTmpl: TemplateRef<any>;
  @ViewChild('searchResults') searchResultsTmpl: TemplateRef<any>;
  @ViewChild('noResults') noResultsTmpl: TemplateRef<any>;
  @ViewChild('fullRecord') fullRecordTmpl: TemplateRef<any>;
  currentResulsTmpl: TemplateRef<any>;

  constructor(
    private route: ActivatedRoute,
    private catalogService: CatalogService,
    private router: Router,
    private alert: AlertService,
    private translate: TranslateService,
    private illService: IllService,
    private memberService : MembersService,
    private storeService: CloudAppStoreService
  ) { }

  ngAfterViewInit() {
    if (!this.illService.isEmpty(this.isBackFromHoldingSearch)) {
      if (this.illService.getSearchResults(this.currentSearchType).getResults() != null) {
        this.setSearchResultsDisplay();
      } else {
        this.currentResulsTmpl = this.notSearchedTmpl;
        this.panelState = true;
      }
    }
  }

  onBackFromViewHolding() {
    this.searchFormRefill();
  }

  /***  Search Form Section  ***/

  fillInItemRecord() {
    this.nacsisID = this.route.snapshot.params['nacsisId'];
    this.title = this.route.snapshot.params['title'];
    this.isbn = this.route.snapshot.params['isbn'];
    this.issn = this.route.snapshot.params['issn'];

    this.itemRecord.nacsisId = this.illService.isEmpty(this.nacsisID) ? '' : this.nacsisID;
    this.itemRecord.title = this.illService.isEmpty(this.title) ? '' : this.title;
    this.itemRecord.isbn = this.illService.isEmpty(this.isbn) ? '' : this.isbn;
    this.itemRecord.issn = this.illService.isEmpty(this.issn) ? '' : this.issn;

    this.itemRecordDisplay.record = this.itemRecord;
  }


  searchFormRefill() {
    let paramsMap = new Map();
    this.illService.setFormValue(this.itemRecordDisplay).split("&").forEach(param => {
      let paramAsKeyValue = param.split("=");
      paramsMap.set(paramAsKeyValue[0], paramAsKeyValue[1]);
    });

    this.pageIndex = paramsMap.get(QueryParams.PageIndex);
    this.pageSize = paramsMap.get(QueryParams.PageSize);
    this.currentSearchType = SearchType[paramsMap.get(QueryParams.SearchType)];
    if (this.currentSearchType == SearchType.Serials) {
      this.selectedIndexBinding = 1;
    }
    this.ALL_SEARCH_FIELDS_MAP.get(this.currentSearchType).forEach(field => {
      if (paramsMap.has(field.getKey())) {
        field.setFormControl(paramsMap.get(field.getKey()));
      }
    });
  }

  getActionMenu() {
    return this.ACTIONS_MENU_LIST.get(this.currentSearchType);
  }


  getSearchTypesLabels(): Array<string> {
    let searchTypeMap = new Array();
    this.SEARCH_TYPE_ARRAY.forEach(type => {
      searchTypeMap.push("Catalog.Form.SearchTypes." + type)
    });
    return searchTypeMap;
  }

  panelOpenState() {
    this.panelState = true;
  }

  panelCloseState() {
    this.panelState = false;
  }

  getSearchFields(): Array<SearchField> {
    return this.ALL_SEARCH_FIELDS_MAP.get(this.currentSearchType);
  }

  setCurrentDatabase(db: string) {
    this.currentDatabase = db;
  }

  onRadioClick(record: IDisplayLines) {
    this.isFirstIndex = 1;
    this.selected = record;
  }


  onTabChange(event: MatTabChangeEvent) {
    this.currentSearchType = this.SEARCH_TYPE_ARRAY[event.index];
    this.currentDatabase = this.getCurrentDatabases()[0];
    if (this.illService.getSearchResults(this.currentSearchType).getResults() != null) {
      this.setSearchResultsDisplay();
    } else {
      this.currentResulsTmpl = this.notSearchedTmpl;
      this.panelState = true;
    }
    this.isRightTableOpen = false;
  }

  getCurrentDatabases(): Array<string> {
    return this.ALL_DATABASES_MAP.get(this.currentSearchType);
  }

  /***  Summary View Section  ***/
  private setSearchResultsDisplay() {
    this.catalogResultsData = this.illService.getSearchResults(this.currentSearchType);
    this.numOfResults = this.catalogResultsData.getHeader().totalRecords;
    this.resultsSummaryDisplay = new Array();
    this.catalogResultsData.getResults()?.forEach(result => {
      this.resultsSummaryDisplay.push(result.getSummaryDisplay());
    });
    this.panelState = false;
    this.resultsTemplateFactory();
  }

  resultsTemplateFactory() {
    if (this.numOfResults > 0) {
      this.currentResulsTmpl = this.searchResultsTmpl;
    } else if (this.numOfResults == 0 || this.numOfResults == null) {
      this.currentResulsTmpl = this.noResultsTmpl;
    } else {
      this.currentResulsTmpl = this.notSearchedTmpl;
    }
  }


  /***  button function  ***/
  clear() {
    this.ALL_SEARCH_FIELDS_MAP.get(this.currentSearchType).forEach(searchField => {
      searchField.getFormControl().setValue(null)
    });
  }

  search() {
    this.isFirstIndex = null;
    // Generating the URL by the fields' Form Control
    let urlParams = "";
    let valuableFields = this.ALL_SEARCH_FIELDS_MAP.get(this.currentSearchType).filter(field => (field.getFormControl().value != null) && (field.getFormControl().value != ""));
    if (valuableFields.length > 0) {
      urlParams = urlParams + QueryParams.PageIndex + "=0&" + QueryParams.PageSize + "=20";
      urlParams = urlParams + "&" + QueryParams.SearchType + "=" + this.currentSearchType;
      urlParams = urlParams + "&" + QueryParams.Databases + "=" + this.currentDatabase;
      valuableFields.forEach(field => {
        urlParams = urlParams + "&" + field.getKey();
        urlParams = urlParams + "=" + field.getFormControl().value;
      });
      this.getResultsFromNacsis(urlParams, false);
    } else {
      return;
    }
  }

  next() {

    let title = this.selected.getFullRecordData().getSummaryView().TRD;
    let nacsisID = this.selected.getFullRecordData().getSummaryView().ID;
    let rawData = this.selected.getFullRecordData().getFullView();
    concat(
      this.storeService.set(SELECTED_RECORD_ILL, JSON.stringify(rawData)),
      this.storeService.set(RESULT_RECORD_LIST_ILL, ''),
      this.storeService.set(ROUTING_STATE_KEY, AppRoutingState.SearchRecordMainPage)
    ).subscribe();
    this.loading = true;
    this.router.navigate(['holdingSearch', nacsisID, title, this.currentSearchType]);
  }


  onTitleClick(recordIndex: number) {
    this.recordIndexSelected = this.pageIndex * this.pageSize + recordIndex
    // Clicking on title will open the full view 
    let record = this.resultsSummaryDisplay[recordIndex];
    this.currentResulsTmpl = this.fullRecordTmpl;
    this.resultFullDisplay = record.getFullRecordData().getFullViewDisplay().initContentDisplay();
  }

  // Calling Nacsis servlet
  getResultsFromNacsis(urlParams: string, isFullViewLink: boolean) {
    this.loading = true;
    try {
      this.catalogService.getSearchResultsFromNacsis(urlParams)
        .subscribe({
          next: (catalogResults) => {
            if (catalogResults.status === this.illService.OkStatus) {
              if (!isFullViewLink) {
                if (catalogResults.totalRecords >= 1) {
                  this.illService.setSearchResultsMap(this.currentSearchType, catalogResults, urlParams);
                  this.setPageIndexAndSize(urlParams);
                  this.setSearchResultsDisplay();
                } else {
                  this.numOfResults = 0;
                  this.resultsTemplateFactory();
                }
              } else {
                if (catalogResults.totalRecords >= 1) {
                  let baseResult = this.illService.resultsTypeFactory(this.currentSearchType, catalogResults.records[0]);
                  this.resultFullLinkDisplay = baseResult.getFullViewDisplay().initContentDisplay();
                  this.isRightTableOpen = true;
                } else {
                  this.resultFullLinkDisplay == null;
                  this.isRightTableOpen = true;
                }
              }
            } else {
              this.alert.error(catalogResults.errorMessage, { keepAfterRouteChange: true });
            }
          },
          error: e => {
            this.loading = false;
            console.log(e.message);
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

  /***   Pagination    ***/

  setPageIndexAndSize(urlParams: string) {
    let pageIndexParam = QueryParams.PageIndex + "=";
    let pageSizeParam = "&" + QueryParams.PageSize + "=";
    let searchTypeParam = "&" + QueryParams.SearchType;
    this.pageIndex = Number(urlParams.split(pageIndexParam).pop().split(pageSizeParam)[0]);
    this.pageSize = Number(urlParams.split(pageSizeParam).pop().split(searchTypeParam)[0]);
  }

  onPageAction(pageEvent: PageEvent) {
    let urlParams = this.illService.getQueryParams(this.currentSearchType);
    let newIndexStr = QueryParams.PageIndex + "=" + pageEvent.pageIndex + "&" + QueryParams.PageSize;
    urlParams = urlParams.replace(/pageIndex=.*pageSize/, newIndexStr);
    let newSizeStr = QueryParams.PageSize + "=" + pageEvent.pageSize + "&" + QueryParams.SearchType;
    urlParams = urlParams.replace(/pageSize=.*searchType/, newSizeStr);

    this.getResultsFromNacsis(urlParams, false);
  }


  ngOnInit() {
    this.isBackFromHoldingSearch = this.route.snapshot.params['flagBack'];
    this.fillInItemRecord();
    this.storeService.get(ROUTING_STATE_KEY).subscribe((backSession)=>{
      this.backSession = backSession;
      if (backSession == "") {
        this.illService.clearAllSearchResults();
      } else {
        this.onBackFromViewHolding();
      }
    });
  }

  ngOnDestroy() {
    this.storeService.set(RESULT_RECORD_LIST_ILL, '').subscribe();
  }


  /***  initializing the search fields   ***/

  initMonographsSearchFields(): Array<SearchField> {
    return new Array(
      new SearchField(FieldName.TITLE, FieldSize.fullWidth),
      new SearchField(FieldName.FTITLE, FieldSize.fullWidth),
      new SearchField(FieldName.PTBL, FieldSize.fullWidth),
      new SearchField(FieldName.AUTH, FieldSize.fullWidth),
      new SearchField(FieldName.VOL, FieldSize.large),
      new SearchField(FieldName.AKEY, FieldSize.large),
      new SearchField(FieldName.PUB, FieldSize.large),
      new SearchField(FieldName.YEAR, FieldSize.large),
      new SearchField(FieldName.PLACE, FieldSize.medium),
      new SearchField(FieldName.CNTRY, FieldSize.medium),
      new SearchField(FieldName.LANG, FieldSize.medium),
      new SearchField(FieldName.SH, FieldSize.medium),
      new SearchField(FieldName.ID, FieldSize.medium),
      new SearchField(FieldName.PID, FieldSize.medium),
      new SearchField(FieldName.ISSN, FieldSize.small),
      new SearchField(FieldName.ISBN, FieldSize.small),
      new SearchField(FieldName.NBN, FieldSize.small),
      new SearchField(FieldName.NDLCN, FieldSize.small),
      new SearchField(FieldName.LCCN, FieldSize.small));
  }

  initSerialsSearchFields(): Array<SearchField> {
    return new Array(new SearchField(FieldName.TITLE, FieldSize.fullWidth),
      new SearchField(FieldName.FTITLE, FieldSize.fullWidth),
      new SearchField(FieldName.AUTH, FieldSize.fullWidth),
      new SearchField(FieldName.ISSN, FieldSize.small),
      new SearchField(FieldName.CODEN, FieldSize.small),
      new SearchField(FieldName.NDLPN, FieldSize.small),
      new SearchField(FieldName.LCCN, FieldSize.small),
      new SearchField(FieldName.PUB, FieldSize.large),
      new SearchField(FieldName.YEAR, FieldSize.large),
      new SearchField(FieldName.SH, FieldSize.small),
      new SearchField(FieldName.AKEY, FieldSize.small),
      new SearchField(FieldName.ID, FieldSize.small),
      new SearchField(FieldName.FID, FieldSize.small),
      new SearchField(FieldName.PLACE, FieldSize.medium),
      new SearchField(FieldName.CNTRY, FieldSize.medium),
      new SearchField(FieldName.LANG, FieldSize.medium));
  }

  /***  view full record  ***/

  onActionsClick(selection: RecordSelection) {
    let record = this.resultsSummaryDisplay[selection.recordIndex];
    switch (selection.actionIndex) {
      case 0: // Full view
        this.currentResulsTmpl = this.fullRecordTmpl;
        this.resultFullDisplay = record.getFullRecordData().getFullViewDisplay().initContentDisplay();
        break;
      default: {
        this.currentResulsTmpl = this.noResultsTmpl;
      }
    }

  }

  onBackFromFullView() {
    this.currentResulsTmpl = this.searchResultsTmpl;
    this.isRightTableOpen = false;
  }

  onFullViewLink(fullViewLink: FullViewLink) {
    let urlParams = "";
    urlParams = urlParams + QueryParams.PageIndex + "=0&" + QueryParams.PageSize + "=20";
    urlParams = urlParams + "&" + QueryParams.SearchType + "=" + fullViewLink.searchType;
    urlParams = urlParams + "&" + QueryParams.Databases + "=" + this.ALL_DATABASES_MAP_SEARCH.get(fullViewLink.searchType)[0];
    urlParams = urlParams + "&" + QueryParams.ID + "=" + fullViewLink.linkID;

    this.getResultsFromNacsis(urlParams, true);
    this.isColapsedMode = (window.innerWidth <= 600) ? true : false;

  }

  onFullViewLinkClose() {
    this.isRightTableOpen = false;
    this.resultFullLinkDisplay = null;
  }

  onResize(event) {
    this.isColapsedMode = (event.target.innerWidth <= 600) ? true : false;
  }

  onFullViewInternalLinkClick(fullViewLink: FullViewLink) {
    let urlParams = QueryParams.PageIndex + "=0&" + QueryParams.PageSize + "=20";
    urlParams = urlParams + "&" + QueryParams.SearchType + "=" + fullViewLink.searchType;
    urlParams =  urlParams + "&" + QueryParams.Databases + "=" + 'MEMBER';
    urlParams =  urlParams + "&" + QueryParams.ID + "=" + fullViewLink.linkID;
    
    this.isColapsedMode = (window.innerWidth <= 600) ? true : false;

    this.loading = true;
    try{
      this.getMemberResult(urlParams);
    } catch (e) {
        this.loading = false;
        console.log(e);
        this.alert.error(this.translate.instant('General.Errors.generalError'), {keepAfterRouteChange:true});      
    }

}

getMemberResult(urlParams : string) {
  this.memberService.getSearchResultsFromNacsis(urlParams)
  .subscribe({
      next: (catalogResults) => {
          if (catalogResults.status === this.illService.OkStatus) {
            if (catalogResults.totalRecords == 1) {
              let baseResult = this.illService.resultsTypeFactory(SearchType.Members, catalogResults.records[0]);
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
}


}