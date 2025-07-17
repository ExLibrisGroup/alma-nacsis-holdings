import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MembersService } from '../../service/members.service';
import { AlertService, CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NacsisCatalogResults, IDisplayLines, ViewLine } from '../../catalog/results-types/results-common'
import { SearchType, SearchField, FieldSize, FieldName, SelectSearchField, SelectedSearchFieldValues } from '../../user-controls/search-form/search-form-utils';
import { PageEvent } from '@angular/material/paginator';
import { AlmaApiService } from '../../service/alma.api.service';
import { RecordSelection, Action } from '../../user-controls/result-card/result-card.component';
import { Router } from '@angular/router';
import { MEMBER_RECORD, ROUTING_STATE_KEY, AppRoutingState, QueryParams, FANO_ID, SELECTED_INTEGRATION_PROFILE } from '../../service/base.service';
import { mergeMap, catchError, } from 'rxjs/operators';
import { of, concat } from 'rxjs';
import { MemberSummaryDisplay } from '../../catalog/results-types/member';

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
  owners: any[];
  isRightTableOpen: boolean = false;
  private selectedValues = new SelectedSearchFieldValues();
  selected: string;
  private fanoId: string;

  // UI variables
  panelState: boolean = true;
  loading: boolean = false;

  // Search variables
  numOfResults: number;
  private totalResults: number;
  pageIndex: number = 0;
  pageSize: number = 20;
  private fieldsMap: Map<FieldName, SearchField> = new Map();

  // Data variables
  resultFullDisplay: Array<ViewLine>;
  private resultFullLinkDisplay: Array<ViewLine>;
  private catalogResultsData: NacsisCatalogResults;
  private resultsSummaryRecord: Array<IDisplayLines>;
  resultsSummaryDisplay: Array<IDisplayLines> = new Array();

  // Templates
  @ViewChild('notSearched') notSearchedTmpl: TemplateRef<any>;
  @ViewChild('searchResults') searchResultsTmpl: TemplateRef<any>;
  @ViewChild('noResults') noResultsTmpl: TemplateRef<any>;
  @ViewChild('fullRecord') fullRecordTmpl: TemplateRef<any>;
  @ViewChild('editForm') editFormTmpl: TemplateRef<any>;
  currentResulsTmpl: TemplateRef<any>;

  public ACTIONS_MENU_LIST = new Array(
    new Action('Catalog.Results.Actions.View', true),
    new Action('Catalog.Results.Actions.Edit', false),
  );

  /*Initialize all the search values of members search form*/
  private initFieldsMap(): void {
    this.fieldsMap.set(FieldName.ID, new SearchField(FieldName.MID, FieldSize.medium));
    this.fieldsMap.set(FieldName.NAME, new SearchField(FieldName.NAME, FieldSize.medium));
    this.fieldsMap.set(FieldName.LOC, new SearchField(FieldName.LOC, FieldSize.medium));
    this.fieldsMap.set(FieldName.KENCODE, new SelectSearchField(this.selectedValues.getRegionCodeList(), true, FieldName.KENCODE, FieldSize.medium));
    this.fieldsMap.set(FieldName.SETCODE, new SelectSearchField(this.selectedValues.getEstablisherTypeList(), true, FieldName.SETCODE, FieldSize.medium));
    this.fieldsMap.set(FieldName.ORGCODE, new SelectSearchField(this.selectedValues.getInstitutionTypeList(), true, FieldName.ORGCODE, FieldSize.medium));
    this.fieldsMap.set(FieldName.GRPCODE, new SelectSearchField(this.selectedValues.getOffsetChargeList(), true, FieldName.GRPCODE, FieldSize.medium));
    this.fieldsMap.set(FieldName.CATFLG, new SelectSearchField(this.selectedValues.getILLParticipationTypeList(), true, FieldName.CATFLG, FieldSize.medium));
    this.fieldsMap.set(FieldName.ILLFLG, new SelectSearchField(this.selectedValues.getILLParticipationTypeList(), true, FieldName.ILLFLG, FieldSize.medium));
    this.fieldsMap.set(FieldName.STAT, new SelectSearchField(this.selectedValues.getServiceStatusList(), false, FieldName.STAT, FieldSize.medium));
    this.fieldsMap.set(FieldName.COPYS, new SelectSearchField(this.selectedValues.getCopyServiceTypeList(), false, FieldName.COPYS, FieldSize.medium));
    this.fieldsMap.set(FieldName.LOANS, new SelectSearchField(this.selectedValues.getLendingServiceTypeList(), false, FieldName.LOANS, FieldSize.medium));
    this.fieldsMap.set(FieldName.FAXS, new SelectSearchField(this.selectedValues.getFAXServiceTypeList(), false, FieldName.FAXS, FieldSize.medium));
  }

  /* Get list of all search value, calling this function from the DOM */
  public getFieldsList(): Array<SearchField> {
    return Array.from(this.fieldsMap.values());
  }

  createSearchFieldListbyFormControlValues(key: FieldName, fieldSize: FieldSize, formControlValues): any[][] {
    let searchFieldsArrary = new Array();
    formControlValues?.forEach(element => {
      searchFieldsArrary.push(new Array(new SearchField(key, FieldSize.medium, element)));
    });
    if (searchFieldsArrary.length < 1) {
      searchFieldsArrary.push(new Array(new SearchField(key, FieldSize.medium, "")));
    }
    return searchFieldsArrary;
  }

  constructor(
    private membersService: MembersService,
    private translate: TranslateService,
    private alert: AlertService,
    protected almaApiService: AlmaApiService,
    private router: Router,
    private storeService: CloudAppStoreService
  ) {
    this.owners = [
      { id: "0", name: "Holdings.ViewHoldings.All" },
      { id: "1", name: "Holdings.ViewHoldings.Mine" }
    ];
  }

  ngOnInit() {
    this.initFieldsMap();
    this.storeService.get(this.membersService.OwnerKey).subscribe(owner=>{
      if (!this.membersService.isEmpty(owner)) {
        this.selected = owner;
      } else if (this.membersService.isEmpty(this.selected)) {
        this.selected = '0'; // owner = All
      }
    })
  }

  ngAfterViewInit() {
    this.storeService.get(ROUTING_STATE_KEY).subscribe(state=>{
      if (state == "") {
        this.membersService.clearAllSearchResults();
      } else {
        this.onBackFromEditForm();
      }
    });
  }

  /* Methods called from the DOM */
  getActionMenu() {
    return this.ACTIONS_MENU_LIST;
  }

  onActionsClick(selection: RecordSelection) {
    let record = this.resultsSummaryRecord[selection.recordIndex];
    switch (selection.actionIndex) {
      case 0: // Full view
        this.currentResulsTmpl = this.fullRecordTmpl;
        this.resultFullDisplay = record.getFullRecordData().getFullViewDisplay().initContentDisplay();
        break;
      case 1: // Edit member
        this.currentResulsTmpl = this.editFormTmpl;
        concat(
          this.storeService.set(MEMBER_RECORD, JSON.stringify(record)),
          this.storeService.set(ROUTING_STATE_KEY, AppRoutingState.MembersMainPage)
        ).subscribe();
        this.router.navigate(['editMember']);
        break;
      default: {
        this.currentResulsTmpl = this.noResultsTmpl;
      }
    }
  }

  panelOpenState() {
    this.panelState = true;
  }

  panelCloseState() {
    this.panelState = false;
  }

  onOwnerSelected() {
    /* owner = All, Mine is included in All, therefore, no need to retrieve from nacsis
       get All only once */
    this.storeService.set(this.membersService.OwnerKey, this.selected).subscribe();
    if (this.selected === '1') {
      this.resultsSummaryDisplay = this.resultsSummaryRecord.filter(member => member.isEditable);
      this.numOfResults = this.resultsSummaryDisplay.length;
    } else {
      this.resultsSummaryDisplay = this.resultsSummaryRecord;
      this.numOfResults = this.totalResults;
    }
    this.resultsTemplateFactory();
  }

  onTitleClick(recordIndex: number) {
    // Click on the title to open the full view mode
    let record = this.resultsSummaryDisplay[recordIndex];
    this.currentResulsTmpl = this.fullRecordTmpl;
    this.
      resultFullDisplay = record.getFullRecordData().getFullViewDisplay().initContentDisplay();
  }

  clear() {
    this.ngOnInit();
  }

  resultExists() {
    this.numOfResults > 0;
  }

  onFullViewLinkClose() {
    this.isRightTableOpen = false;
    this.resultFullLinkDisplay = null;
  }

  /* Search methoeds */
  public search(): void {
    this.loading = true;
    let queryParams = this.buildQueryUrl();
    this.getSearchResultsFromNacsis(queryParams);

  }

  //Run over all formControl and build the QueryParams for the get request
  private buildQueryUrl(): string {
    let urlParams: string = "";
    urlParams = urlParams + QueryParams.PageIndex + "=0&" + QueryParams.PageSize + "=20";
    urlParams = urlParams + "&" + QueryParams.SearchType + "=" + SearchType.Members;
    this.fieldsMap.forEach((value, key) => {
      urlParams = this.buildParamField(urlParams, key, value);
    });
    return urlParams;
  }

  //Get the search value from specific searchForm
  buildParamField(urlParams: string, fieldName: FieldName, fieldValue: SearchField) {
    let value: string = fieldValue.getFormControl().value;
    if (!this.membersService.isEmpty(value)) {
      let concatValue = "";
      urlParams = urlParams + "&" + fieldName;
      if (fieldValue instanceof SelectSearchField && Array.isArray(fieldValue.getFormControl().value)) {
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

  getSearchResultsFromNacsis(queryParams: string) {
    this.loading = true;
    this.storeService.get(SELECTED_INTEGRATION_PROFILE).pipe(
    mergeMap(profile => {
        const integrationProfile =  JSON.parse(profile)
        console.log("what about the fano!?");
        this.fanoId = integrationProfile.libraryID;
        this.storeService.set(FANO_ID, this.fanoId).subscribe();
        return this.membersService.getSearchResultsFromNacsis(queryParams);
      }),
      mergeMap(nacsisResponse => {
        if (nacsisResponse.status === this.membersService.OkStatus) {
          if (nacsisResponse.totalRecords >= 1) {
            this.numOfResults = nacsisResponse.totalRecords;
            this.totalResults = nacsisResponse.totalRecords;
            this.setPageIndexAndSize(queryParams);
            this.membersService.setSearchResultsMap(SearchType.Members, nacsisResponse, queryParams);
            this.setSearchResultsDisplay();
          } else {
            this.panelState = false;
            this.numOfResults = 0;
            this.resultsTemplateFactory();
          }
          if (this.selected === '1') {
            this.resultsSummaryDisplay = this.resultsSummaryRecord.filter(member => member.isEditable);
          } else {
            this.resultsSummaryDisplay = this.resultsSummaryRecord;
          }
        } else {
          this.alert.error(nacsisResponse.errorMessage, { keepAfterRouteChange: true });
        }
        this.loading = false;
        return of(0);
      }),
      catchError(error => {
        this.loading = false;
        console.log(error.message);
        this.alert.error(this.translate.instant('General.Errors.generalError'), { keepAfterRouteChange: true });
        return of(0);
      })
    ).subscribe();
  }

  /* Pagination */
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
  resultsTemplateFactory() {
    if(this.numOfResults > 0){
        this.currentResulsTmpl = this.searchResultsTmpl;
    } else if(this.numOfResults == 0 || this.numOfResults == null) {
        this.currentResulsTmpl = this.noResultsTmpl;
    } else {
        this.currentResulsTmpl = this.notSearchedTmpl;
    }
}

  onBackFromFullView() {
    this.currentResulsTmpl = this.searchResultsTmpl;
    this.isRightTableOpen = false;
  }

  searchFormRefill() {
    let paramsMap = new Map();
    this.membersService.getQueryParams(SearchType.Members).split("&").forEach(param => {
      let paramAsKeyValue = param.split("=");
      paramsMap.set(paramAsKeyValue[0], paramAsKeyValue[1]);
    });
    this.pageIndex = paramsMap.get(QueryParams.PageIndex);
    this.pageSize = paramsMap.get(QueryParams.PageSize);
  }

  onBackFromEditForm() {
    this.setSearchResultsDisplay();
    this.numOfResults = this.resultsSummaryDisplay.length;
    this.resultsTemplateFactory();
  }

  /*Build the data */
  private setSearchResultsDisplay() {
    this.catalogResultsData = this.membersService.getSearchResults(SearchType.Members);
    this.resultsSummaryRecord = new Array();
    this.catalogResultsData.getResults()?.forEach(result => {
      let summery = result.getSummaryDisplay()
      /* If the memeber is mine - we can edit it */
      //TODO: check the async code here:
      this.storeService.get(FANO_ID).subscribe(fanoId=>{
        summery.setEnableEdit(result.getSummaryView().ID === fanoId);
        this.resultsSummaryRecord.push(summery);
        this.resultsSummaryDisplay = this.resultsSummaryRecord;
        this.panelState = false;
        this.resultsTemplateFactory();
      });      
    });
    // this.resultsSummaryDisplay = this.resultsSummaryRecord;
    // this.panelState = false;
    // this.resultsTemplateFactory();
  }

  getDisplayMembers() {
    if (this.resultsSummaryDisplay) {
      if (this.selected == '0') { // All
        return this.resultsSummaryDisplay.sort((a: IDisplayLines, b: IDisplayLines) => { // sort list --> Mine first 
          if (a.isEditable) {
            return -1;
          } else if (b.isEditable) {
            return 1;
          } else {
            return 0;
          }
        });
      }
      return this.resultsSummaryDisplay.filter((member : MemberSummaryDisplay) => member.isEditable);
    }
  }
}