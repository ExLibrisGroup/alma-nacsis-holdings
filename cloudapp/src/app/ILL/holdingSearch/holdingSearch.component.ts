import {  Component, ViewChild, OnInit, OnChanges, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HoldingsService, HoldingsSearch, NacsisHoldingRecord, DisplayHoldingResult, NacsisBookHoldingsListDetail, NacsisSerialHoldingsListDetail } from '../../service/holdings.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { ROUTING_STATE_KEY,LIBRARY_ID_KEY } from '../../service/base.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormControl } from '@angular/forms';
import { IllService } from '../../service/ill.service';
import { holdingFormGroup, FieldName } from './holdingSearch-utils';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { WarningDialogComponent } from '../warningDialog/warningDialog';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NacsisCatalogResults, BaseResult, IDisplayLines, ViewLine, ViewField } from '../../catalog/results-types/results-common'
import { CatalogService } from '../../service/catalog.service';
import { SearchType } from '../../user-controls/search-form/search-form-utils';
import { FullViewLink } from '../../catalog/full-view-display/full-view-display.component';

@Component({
  selector: 'ILL-holdingSearch',
  templateUrl: './holdingSearch.component.html',
  styleUrls: ['./holdingSearch.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class HoldingSearchComponent implements OnInit, OnChanges {
  //basic variable
  nacsisId: string;
  mmsTitle: string;
  owners: any[];
  loading = false;
  selected: string;
  private isRightTableOpen: boolean = false;
  private isColapsedMode: boolean = true;

  backSession;
  form: FormGroup;
  holdingSearch: HoldingsSearch;
  localLibraryID: string;

  // UI variables
  private panelState: boolean = true;
  regionCode = new FormControl();
  regionCodeList: string[] = [
    '01 北海道', '02 青森', '03 岩手', '04 宮城', '05 秋田', '06 山形',
    '07 福島', '08 茨城', '09 栃木', '10 群馬', '11 埼玉', '12 千葉',
    '13 東京', '14 神奈川', '15 新潟', '16 富山', '17 石川', '18 福井',
    '19 山梨', '20 長野', '21 岐阜', '22 静岡', '23 愛知', '24 三重',
    '25 滋賀', '26 京都', '27 大阪', '28 兵庫', '29 奈良', '30 和歌山',
    '31 鳥取', '32 島根', '33 岡山', '34 広島', '35 山口', '36 徳島',
    '37 香川', '38 愛媛', '39 高知', '40 福岡', '41 佐賀', '42 長崎',
    '43 熊本', '44 大分', '45 宮崎', '46 鹿児島', '47 沖縄', 'なし 全国'];

  establisherType = new FormControl();
  establisherTypeList: EstablisherType[] = [
    { value: '1', viewValue: 'National' },
    { value: '2', viewValue: 'Public' },
    { value: '3', viewValue: 'Private' },
    { value: '4', viewValue: 'Special public corporation' },
    { value: '5', viewValue: 'Overseas' },
    { value: '8', viewValue: 'Training/testing' },
    { value: '9', viewValue: 'Other' }
  ];
  establisherTypeResult: string[] = [
    '1 国立', '2 公立', '3 私立', '4 特殊法人', '5 海外', '8 研修・テスト用', '9 その他'
  ];


  institutionType = new FormControl();
  institutionTypeList: InstitutionType[] = [
    { value: '1', viewValue: 'University' },
    { value: '2', viewValue: 'Junior college' },
    { value: '3', viewValue: 'College of technology' },
    { value: '4', viewValue: 'Inter-university research institutes' },
    { value: '5', viewValue: 'Facilities of other ministries' },
    { value: '8', viewValue: 'Training/testing' },
    { value: '9', viewValue: 'Other' }
  ];
  institutionTypeResult: string[] = [
    '1 大学', '2 短期大学', '3 高等専門学校', '4 大学共同利用機関等', '5 他省庁の施設機関等', '8 研修・テスト用', '9 その他'
  ];

  iLLParticipationType = new FormControl();
  iLLParticipationTypeList: ILLParticipationType[] = [
    { value: 'A', viewValue: 'Participate' },//Default
    { value: 'N', viewValue: 'Do not participate' },
    { value: '', viewValue: 'None' }
  ];


  serviceStatus = new FormControl();
  serviceStatusList: ServiceStatus[] = [
    { value: 'A', viewValue: 'Available' },//Default
    { value: 'N', viewValue: 'Not available' },
    { value: '', viewValue: 'None' }
  ];


  offsetCharge = new FormControl();
  offsetChargeList: OffsetCharge[] = [
    { value: '', viewValue: 'None' },
    { value: 'N', viewValue: 'Participate in ILL offset service' }
  ];

  copyServiceType = new FormControl();
  copyServiceTypeList: CopyServiceType[] = [
    { value: 'A', viewValue: 'Accept' },
    { value: 'C', viewValue: 'Accept at other counters' },
    { value: 'N', viewValue: 'Not accepted' }
  ];

  lendingServiceType = new FormControl();
  lendingServiceTypeList: LendingServiceType[] = [
    { value: 'A', viewValue: 'Accept' },
    { value: 'C', viewValue: 'Accept at other counters' },
    { value: 'N', viewValue: 'Not accepted' }
  ];

  fAXServiceType = new FormControl();
  fAXServiceTypeList: FAXServiceType[] = [
    { value: 'A', viewValue: 'Accept' },
    { value: 'C', viewValue: 'Conditionally available' },
    { value: 'N', viewValue: 'Not accepted' }
  ];

  //result view
  displayedColumns: string[] = ['index', 'select', 'name', 'vol', 'region',
    'establisher', 'institutionType', 'location', 'photoCopy_fee', 'ill', 'stat',
    'photoCopy', 'loan', 'fax', 'actionsColumn'];

  displayHoldingResult = new MatTableDataSource<DisplayHoldingResult>();
  @ViewChild(MatSort) sort: MatSort;
  @ViewChildren('myCheckbox') private myCheckboxes: QueryList<any>;

  nacsisHoldingsResultList: Array<NacsisHoldingRecord> = new Array();
  holdings: DisplayHoldingResult[];
  noHoldingRecords: boolean = false;
  isBook: boolean = false;
  public ACTIONS_MENU_LIST: string[] = [
    'ILL.Results.Actions.ViewHolding', 'ILL.Results.Actions.ViewMemInfo'
  ];

  //selection box
  selectedIndex: any = [];
  selectedVol: string;
  isMaxRowSelected: boolean = false;
  numOfResults: number;
  selection = new SelectionModel<DisplayHoldingResult>(true, []);
  selecedData: any = [];

  //expand details
  expandedElement: DisplayHoldingResult | null;
  isViewHolding: boolean = true;
  public currentSearchType: SearchType = SearchType.Monographs;
  private catalogResultsData: NacsisCatalogResults;
  private resultsSummaryDisplay: Array<IDisplayLines>;
  private resultFullDisplay;
  private resultFullLinkDisplay;
  public ALL_DATABASES_MAP_SEARCH = new Map([
    [SearchType.Monographs, ['BOOK', 'PREBOOK', 'JPMARC', 'TRCMARC', 'USMARC', 'USMARCX', 'GPOMARC', 'UKMARC', 'REMARC', 'DNMARC', 'CHMARC', 'KORMARC', 'RECON', 'HBZBKS', 'SPABKS', 'ITABKS', 'KERISB', 'KERISX', 'BNFBKS']],
    [SearchType.Serials, ['SERIAL', 'JPMARCS', 'USMARCS', 'SPASER', 'ITASER', 'KERISS', 'BNFSER']],
    [SearchType.Names, ['NAME', 'JPMARCA', 'USMARCA']],
    [SearchType.UniformTitles, ['TITLE', 'USMARCT']]
  ]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private illService: IllService,
    private catalogService: CatalogService,
    //private http: HttpClient,
    private translate: TranslateService,
    private nacsis: HoldingsService,
    private dialog: MatDialog,
    private alert: AlertService,
    private _liveAnnouncer: LiveAnnouncer

  ) {
    this.owners = [
      { id: "0", name: this.translate.instant('Holdings.ViewHoldings.All') },
      { id: "1", name: this.translate.instant('Holdings.ViewHoldings.Mine') }
    ];
  }


  ngOnInit() {
    this.nacsisId = this.route.snapshot.params['nacsisId'];
    this.mmsTitle = this.route.snapshot.params['mmsTitle'];
    this.currentSearchType = this.route.snapshot.params['searchType'];
    this.backSession = sessionStorage.getItem(ROUTING_STATE_KEY);
    this.form = holdingFormGroup(null);
    this.selection = new SelectionModel<DisplayHoldingResult>(true, []);
    this.isMaxRowSelected = false;
  }

  ngOnChanges(holdings) {
    this.displayHoldingResult = new MatTableDataSource<DisplayHoldingResult>(holdings);
    this.displayHoldingResult.sort = this.sort;

  }

  search() {
    this.loading = true;
    let queryParams = this.buildQueryUrl();
    try {
      this.nacsis.getHoldingsForILLFromNacsis(queryParams)
        .subscribe({
          next: (header) => {
            if (header.status === this.nacsis.OkStatus) {
              this.nacsisHoldingsResultList = header.nacsisRecordList;
              this.isBook = (header.type == 'BOOK') ? true : false;
              if (this.nacsisHoldingsResultList != null && this.nacsisHoldingsResultList.length > 0) {
                this.holdings = this.setDisplayDetails(this.nacsisHoldingsResultList);
                this.ngOnChanges(this.holdings);
              }
            } else {
              this.holdings = new Array();
              this.noHoldingRecords = true;
              this.numOfResults = 0;
            }
          },
          error: e => {
            this.loading = false;
            console.log(e.message);
            this.alert.error(e.message, { keepAfterRouteChange: true });
          },
          complete: () => {
            this.loading = false;
            this.panelState = false;
          }
        });
    } catch (e) {
      this.loading = false;
      this.panelState = false;
      console.log(e);
      this.alert.error(this.translate.instant('General.Errors.generalError'), { keepAfterRouteChange: true });
    }
  }

  buildQueryUrl() {
    let urlParams = "";
    urlParams = "nacsisId=" + this.nacsisId;

    urlParams = this.buildParamField_text(urlParams, FieldName.FANO, this.form.value.FANO);
    urlParams = this.buildParamField_text(urlParams, FieldName.VOL, this.form.value.VOL_HLV);
    urlParams = this.buildParamField_text(urlParams, FieldName.YEAR, this.form.value.CPYR_HLYR);
    urlParams = this.buildParamField_text(urlParams, FieldName.LOC, this.form.value.LOC);

    urlParams = this.buildParamField_selectBox(urlParams, FieldName.KENCODE, this.regionCode.value);
    urlParams = this.buildParamField_selectBox(urlParams, FieldName.SETCODE, this.establisherType.value);
    urlParams = this.buildParamField_selectBox(urlParams, FieldName.ORGCODE, this.institutionType.value);
    urlParams = this.buildParamField_text(urlParams, FieldName.GRPCODE, this.offsetCharge.value);

    urlParams = this.buildParamField_text(urlParams, FieldName.ILLFLG, this.iLLParticipationType.value);
    urlParams = this.buildParamField_text(urlParams, FieldName.STAT, this.serviceStatus.value);
    urlParams = this.buildParamField_selectBox(urlParams, FieldName.COPYS, this.copyServiceType.value);
    urlParams = this.buildParamField_selectBox(urlParams, FieldName.LOANS, this.lendingServiceType.value);

    urlParams = this.buildParamField_selectBox(urlParams, FieldName.FAXS, this.fAXServiceType.value);
    return urlParams;
  }

  buildParamField_text(urlParams, fieldName, fieldValue) {
    if (!this.illService.isEmpty(fieldValue)) {
      urlParams = urlParams + "&" + fieldName;
      urlParams = urlParams + "=" + fieldValue;
    }
    return urlParams;
  }

  buildParamField_selectBox(urlParams, fieldName, fieldValue) {
    if (!this.illService.isEmpty(fieldValue)) {
      let valueArr = fieldValue;
      urlParams = urlParams + "&" + fieldName;
      let concatValue = "";
      valueArr.forEach(value => {
        value = value.split(" ")[0];
        concatValue = concatValue.concat(value, ',');
      });
      urlParams = urlParams + "=" + concatValue;
      if (urlParams.endsWith(",")) {
        urlParams = urlParams.substring(0, urlParams.length - 1);
      }
    }
    return urlParams;
  }

  clear() {
    this.ngOnInit();
    this.regionCode = new FormControl();
    this.establisherType = new FormControl();
    this.institutionType = new FormControl();
    this.serviceStatus = new FormControl();
    this.offsetCharge = new FormControl();
    this.copyServiceType = new FormControl();
    this.lendingServiceType = new FormControl();
    this.fAXServiceType = new FormControl();
    this.iLLParticipationType = new FormControl();
    this.holdings = new Array();
    this.panelState = true;
    this.selected = "";
  }

  panelOpenState() {
    this.panelState = true;
  }

  panelCloseState() {
    this.panelState = false;
  }

  isHoldingRecordsExist() {
    return (this.holdings && this.holdings.length > 0);
  }

  getDisplayedColumns(): string[] {
    if (this.isBook) {
      return ['index', 'select', 'name', 'vol', 'region',
        'establisher', 'institutionType', 'location', 'photoCopy_fee', 'ill', 'stat',
        'photoCopy', 'loan', 'fax', 'actionsColumn'];
    } else {
      return ['index', 'select', 'name', 'hlv', 'hlyr', 'region',
        'establisher', 'institutionType', 'location', 'photoCopy_fee', 'ill', 'stat',
        'photoCopy', 'loan', 'fax', 'actionsColumn'];
    }
  }

  getExpandedDetailColumns(): string[] {
    if (this.isViewHolding) {
      return ['viewHoldingDetail'];
    } else {
      return ['viewMemInfoDetail'];
    }
  }

  announceSortChange(sortState: Sort) {

    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  setDisplayDetails(nacsisHoldingsResultList: any[]) {
    let index: number = 0;
    this.holdings = new Array();
    nacsisHoldingsResultList.forEach(nacsisHoldingsResult => {
      let holding: DisplayHoldingResult = new DisplayHoldingResult();
      let nacsisHoldingsList = new Array();
      index++;
      holding.index = index;
      holding.name = nacsisHoldingsResult.LIBABL;

      // VOL or HLV
      nacsisHoldingsList = nacsisHoldingsResult.nacsisHoldingsList;
      if (nacsisHoldingsList != null && nacsisHoldingsList.length > 0) {
        if (this.isBook) {
          holding.vol = this.extractVolFromHoldingList(nacsisHoldingsList, 'vol');
        } else {
          holding.hlv = this.extractHlvFromHoldingList(nacsisHoldingsList, 'hlv');
          holding.hlyr = this.extractHlvFromHoldingList(nacsisHoldingsList, 'hlyr');
          holding.cln = this.extractHlvFromHoldingList(nacsisHoldingsList, 'cln');
          holding.ldf = this.extractHlvFromHoldingList(nacsisHoldingsList, 'ldf');
        }
      }

      holding.region = this.convertMapping(nacsisHoldingsResult.KENCODE, 'KENCODE');
      holding.establisher = this.convertMapping(nacsisHoldingsResult.SETCODE, 'SETCODE');
      holding.institutionType = this.convertMapping(nacsisHoldingsResult.ORGCODE, 'ORGCODE');
      holding.fee = nacsisHoldingsResult.GRPCODE;
      holding.location = nacsisHoldingsResult.LOC;
      holding.photoCopy_fee = nacsisHoldingsResult.SUM;
      holding.ill = nacsisHoldingsResult.ILLFLG;
      holding.stat = nacsisHoldingsResult.STAT;
      holding.photoCopy = nacsisHoldingsResult.COPYS;
      holding.loan = nacsisHoldingsResult.LOANS;
      holding.fax = nacsisHoldingsResult.FAXS;
      //extend data
      holding.id = nacsisHoldingsResult.ID;
      holding.crtdt = this.formatDate(nacsisHoldingsResult.CRTDT);
      holding.rnwdt = this.formatDate(nacsisHoldingsResult.RNWDT);
      holding.fano = nacsisHoldingsResult.FANO;

      holding.isSelected = false;

      this.holdings.push(holding);
    });
    this.numOfResults = index;
    console.log(this.holdings);
    return this.holdings;
  }

  convertMapping(code: any, tag: string) {
    let name = '';
    let paramsMap = new Map();
    switch (tag) {
      case 'KENCODE':
        paramsMap = this.fillParamMapWithTypeList(paramsMap, this.regionCodeList);
        break;
      case 'SETCODE':
        paramsMap = this.fillParamMapWithTypeList(paramsMap, this.establisherTypeResult);
        break;
      case 'ORGCODE':
        paramsMap = this.fillParamMapWithTypeList(paramsMap, this.institutionTypeResult);
        break;
    }
    name = paramsMap.get(code);
    return name;
  }

  fillParamMapWithTypeList(paramsMap, CodeAndNameList) {
    CodeAndNameList.forEach(CodeAndName => {
      paramsMap.set(CodeAndName.split(" ")[0], CodeAndName.split(" ")[1]);
    })
    return paramsMap;
  }

  extractVolFromHoldingList(nacsisHoldingsList: any[], tag: string) {

    let fieldArr = [];
    let indexVol: number = 0;
    nacsisHoldingsList.forEach(nacsisHolding => {

      let bookHolDetail: NacsisBookHoldingsListDetail = new NacsisBookHoldingsListDetail();
      switch (tag) {
        case 'vol':
          bookHolDetail.index = indexVol;
          bookHolDetail.VOL = this.illService.isEmpty(nacsisHolding.VOL) ? '-' : nacsisHolding.VOL;
          bookHolDetail.RGTN = this.illService.isEmpty(nacsisHolding.RGTN) ? '-' : nacsisHolding.RGTN;
          bookHolDetail.LDF = this.illService.isEmpty(nacsisHolding.LDF) ? '-' : nacsisHolding.LDF;
          fieldArr.push(bookHolDetail);
          break;
      }
      indexVol++;
    });
    return fieldArr;
  }

  extractHlvFromHoldingList(nacsisHoldingsList: any[], tag: string) {
    let fieldValue = "";
    nacsisHoldingsList.forEach(nacsisHolding => {

      switch (tag) {
        case 'hlv':
          fieldValue = this.illService.isEmpty(nacsisHolding.HLV) ? '-' : nacsisHolding.HLV;
          break;
        case 'hlyr':
          fieldValue = this.illService.isEmpty(nacsisHolding.HLYR) ? '-' : nacsisHolding.HLYR;
          break;
        case 'cln':
          fieldValue = this.illService.isEmpty(nacsisHolding.CLN) ? '-' : nacsisHolding.CLN;
          break;
        case 'ldf':
          fieldValue = this.illService.isEmpty(nacsisHolding.LDF) ? '-' : nacsisHolding.LDF;
          break;
      }
    });

    return fieldValue;
  }


  extractFieldFromHoldingList(nacsisHoldingsList: any[], tag: string) {
    let fieldValue = '';
    nacsisHoldingsList.forEach(nacsisHolding => {
      let field = '';
      switch (tag) {
        case 'HLYR':
          field = nacsisHolding.HLYR;
          if (this.illService.isEmpty(field)) {
            fieldValue = field;
          }
          break;
      }

    });
    return fieldValue;
  }

  getCheckboxesData(row) {
    if (row.checked === true) {
      if (!this.maxReached()) {
        this.isMaxRowSelected = false;
        this.selecedData.push(row);
        this.fillIndexIntoArray(this.selecedData);
      } else {

        setTimeout(() => {
          row.checked = false;
          this.isMaxRowSelected = true;
          //this.dialog.open(
          //   WarningDialogComponent,
          //   {width:'400px'});
        });
      }
    } else if (row.checked === false) {
      this.isMaxRowSelected = false;
      this.selecedData = this.selecedData.filter(el => {
        return el.index !== row.index;
      });
      this.fillIndexIntoArray(this.selecedData);
    }
    //console.log('selected', this.selecedData);
  }

  fillIndexIntoArray(selecedData) {
    this.selectedIndex = new Array();
    selecedData.forEach(element => {
      this.selectedIndex.push(element.index);
    });
  }

  maxReached(): boolean {
    return this.selecedData.length === 5;
  }


  private getActionMenu() {
    return this.ACTIONS_MENU_LIST;
  }

  onActionsClick(expandedElement, element, actionIndex) {

    switch (actionIndex) {
      case 0: // view holding
        this.isViewHolding = true;
        return expandedElement === element ? null : element;

      case 1: // view member info
        this.isViewHolding = false;
        this.setSearchResultsDisplay();
        let record = this.resultsSummaryDisplay[element.index - 1];
        this.resultFullDisplay = record.getFullRecordData().getFullViewDisplay().initContentDisplay();
        return expandedElement === element ? null : element;

    }
  }

  onVolSelected(vol) {
    console.log(this);
    console.log(vol);
  }

  onOwnerSelected() {
    this.localLibraryID = sessionStorage.getItem(LIBRARY_ID_KEY);
    sessionStorage.setItem(this.nacsis.OwnerKey, this.selected);
    // just set this.nacsisHoldingsResultList to this.holdings.

    if(this.selected === '0'){
      this.noHoldingRecords = false;
      this.holdings = this.setDisplayDetails(this.nacsisHoldingsResultList);
      
    }else if(this.selected === '1'){
      let localnacsisHoldingsResultList = this.nacsisHoldingsResultList.filter(e => e.FANO === this.localLibraryID);
      this.holdings = this.setDisplayDetails(localnacsisHoldingsResultList);
      if(this.holdings.length == 0){
        this.noHoldingRecords = true;
      }
    }
    console.log(this);
    this.numOfResults = this.nacsisHoldingsResultList.length;
    this.ngOnChanges(this.holdings);
  }

  clearSelection() {
    let myCheckboxes = this.myCheckboxes.toArray();
    myCheckboxes.forEach(myCheckbox => {
      myCheckbox.checked = false;
    });
    this.selection.clear();
    this.selecedData = new Array();
    this.fillIndexIntoArray(this.selecedData);
    this.isMaxRowSelected = false;
  }

  formatDate(dateTime: string) {
    if (!this.illService.isEmpty(dateTime) && dateTime.length == 8) {
      return dateTime.substring(0, 4) + "/" + dateTime.substring(4, 6) + "/" + dateTime.substring(6, 8);
    }
    return dateTime;
  }

  private setSearchResultsDisplay() {
    this.catalogResultsData = this.catalogService.getSearchResults(this.currentSearchType);
    this.resultsSummaryDisplay = new Array();
    this.catalogResultsData.getResults()?.forEach(result => {
      this.resultsSummaryDisplay.push(result.getSummaryDisplay());
    });
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

  getResultsFromNacsis(urlParams: string, isFullViewLink: boolean) {
    this.loading = true;
    try {
      this.catalogService.getSearchResultsFromNacsis(urlParams)
        .subscribe({
          next: (catalogResults) => {
            if (catalogResults.status === this.catalogService.OkStatus) {
              if (!isFullViewLink) {
                if (catalogResults.totalRecords >= 1) {
                  this.catalogService.setSearchResultsMap(this.currentSearchType, catalogResults, urlParams);
                  
                  this.setSearchResultsDisplay();
                } else {
                  this.numOfResults = 0;
                  
                }
              } else {
                if (catalogResults.totalRecords >= 1) {
                  let baseResult = this.catalogService.resultsTypeFactory(this.currentSearchType, catalogResults.records[0]);
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

  isEvenRow(i: number) {
    if (i % 2 != 0) {
      return "expand-tr";
    }
  }

}



interface EstablisherType {
  value: string;
  viewValue: string;
}

interface InstitutionType {
  value: string;
  viewValue: string;
}


interface ILLParticipationType {
  value: string;
  viewValue: string;
}

interface ServiceStatus {
  value: string;
  viewValue: string;
}

interface OffsetCharge {
  value: string;
  viewValue: string;
}

interface CopyServiceType {
  value: string;
  viewValue: string;
}

interface LendingServiceType {
  value: string;
  viewValue: string;
}

interface FAXServiceType {
  value: string;
  viewValue: string;
}

export enum QueryParams {
  PageIndex = "pageIndex",
  PageSize = "pageSize",
  SearchType = "searchType",
  Databases = "dataBase",
  ID = "ID"
}
