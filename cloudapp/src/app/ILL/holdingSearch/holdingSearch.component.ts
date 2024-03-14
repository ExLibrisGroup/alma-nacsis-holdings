import { Component, ViewChild, OnInit, OnChanges, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HoldingsService, HoldingsSearch, NacsisHoldingRecord, DisplayHoldingResult, NacsisBookHoldingsListDetail, NacsisSerialHoldingsListDetail } from '../../service/holdings.service';
import { AlertService, CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';
import { AppRoutingState, ROUTING_STATE_KEY, RESULT_RECORD_LIST_ILL,SELECTED_RECORD_LIST_ILL, HOLDINGS_COLUMNS, HOLDINGS_SEARCH_FIELDS } from '../../service/base.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup } from '@angular/forms';
import { IllService } from '../../service/ill.service';
import { holdingFormGroup } from './holdingSearch-utils';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NacsisCatalogResults, IDisplayLines } from '../../catalog/results-types/results-common'
import { SearchType , SelectedSearchFieldValues, SelectSearchField, SearchField, FieldName, FieldSize} from '../../user-controls/search-form/search-form-utils';
import { MembersService } from '../../service/members.service';
import { concat, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';


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
  isRightTableOpen: boolean = false;
  isColapsedMode: boolean = true;

  form: FormGroup;
  holdingSearch: HoldingsSearch;
  localLibraryID: string;
  rawData: string;
  localMemberInfo:any[];

  // UI variables
  panelState: boolean = true;
  //Configure table
  columnsList: string[] = ['NAME', 'VOL', 'HLV', 'HLYR', 'KENCODE', 'SETCODE', 'ORGCODE', 'LOC', 'SUM', 'ILLFLG', 'STAT', 'COPYS', 'LOANS', 'FAXS'];
  columns = {}

  stickyFields : string[] = ['_KENCODE_', '_SETCODE_', '_ORGCODE_', '_ILLFLG_', '_STAT_', '_GRPCODE_'];
  stickyFieldsMap = new Map();
  
  //result view
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
  isMaxRowSelected: boolean = false;
  numOfResults: number;
  selection = new SelectionModel<DisplayHoldingResult>(true, []);
  selecedData: any = [];
  selectedVolMap = new Map();

  //expand details
  expandedElement: DisplayHoldingResult | null;
  isViewHolding: boolean = true;
  public currentSearchType: SearchType = SearchType.Members;
  public routerSearchType: SearchType = SearchType.Monographs;
  private catalogResultsData: NacsisCatalogResults;
  private resultsSummaryDisplay: Array<IDisplayLines>;
  resultFullDisplay;
  private resultFullLinkDisplay;
  public ALL_DATABASES_MAP_SEARCH = new Map([
    [SearchType.Monographs, ['BOOK', 'PREBOOK', 'JPMARC', 'TRCMARC', 'USMARC', 'USMARCX', 'GPOMARC', 'UKMARC', 'REMARC', 'DNMARC', 'CHMARC', 'KORMARC', 'RECON', 'HBZBKS', 'SPABKS', 'ITABKS', 'KERISB', 'KERISX', 'BNFBKS']],
    [SearchType.Serials, ['SERIAL', 'JPMARCS', 'USMARCS', 'SPASER', 'ITASER', 'KERISS', 'BNFSER']],
    [SearchType.Names, ['NAME', 'JPMARCA', 'USMARCA']],
    [SearchType.UniformTitles, ['TITLE', 'USMARCT']]
  ]);

  selectedValues = new SelectedSearchFieldValues();
  fieldsMap =  new Map();
  private configColMap: Map<String, boolean> = new Map();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private illService: IllService,
    private translate: TranslateService,
    private nacsis: HoldingsService,
    private membersService: MembersService,
    private alert: AlertService,
    private _liveAnnouncer: LiveAnnouncer,
    private storeService: CloudAppStoreService
  ) {
    this.owners = [
      { id: "0", name: "Holdings.ViewHoldings.All" },
      { id: "1", name: "Holdings.ViewHoldings.Mine" }
    ];
  }


  ngOnInit() {
    this.storeService.get(HOLDINGS_COLUMNS).pipe(
      mergeMap(columns =>{
        if(this.illService.isObjectEmpty(columns)) {
          this.columnsList.forEach(col => {
          this.columns[col] = true;
          });
        } else {
          this.columns = JSON.parse(columns);
        }
        return this.storeService.get(RESULT_RECORD_LIST_ILL);
      }),
      mergeMap(lastResult => {
        if(!this.illService.isEmpty(lastResult)){
          this.holdings =  JSON.parse(lastResult);
          this.ngOnChanges(this.holdings);
          this.panelState = false;
        }
        return of();
      })
    ).subscribe();

    this.nacsisId = this.route.snapshot.params['nacsisId'];
    this.mmsTitle = this.route.snapshot.params['mmsTitle'];
    this.routerSearchType = this.route.snapshot.params['searchType'];

    this.form = holdingFormGroup(null);
    this.selection = new SelectionModel<DisplayHoldingResult>(true, []);
    this.isMaxRowSelected = false;
    this.selected = "0";
    this.initConfigColMap();
    this.initFieldsMap();
  }

  ngOnChanges(holdings) {
    this.displayHoldingResult = new MatTableDataSource<DisplayHoldingResult>(holdings);
    this.displayHoldingResult.sort = this.sort;
    this.selectedVolMap = new Map();
    this.numOfResults = holdings.length;
  }

  setValueToFormControl() {
    const self = this;
    this.stickyFields.forEach(field => {
      self.fieldsMap.get(field).getFormControl().value = self.stickyFieldsMap.get(field);
    })  
  }

  initFieldsMap() {
    this.storeService.get(HOLDINGS_SEARCH_FIELDS).subscribe(stickyFields => {
      this.fieldsMap.set(FieldName.FANO , new SearchField(FieldName.FANO, FieldSize.small)); 
      this.fieldsMap.set(FieldName.VOL , new SearchField(FieldName.VOL, FieldSize.small));
      this.fieldsMap.set(FieldName.YEAR, new SearchField(FieldName.YEAR, FieldSize.small)); 
      this.fieldsMap.set(FieldName.LOC, new SearchField(FieldName.LOC, FieldSize.small));
      this.fieldsMap.set(this.addUnderScore(FieldName.KENCODE), new SelectSearchField( this.selectedValues.getRegionCodeList(), true, FieldName.KENCODE, FieldSize.medium)); 
      this.fieldsMap.set(this.addUnderScore(FieldName.SETCODE) , new SelectSearchField(this.selectedValues.getEstablisherTypeList(), true, FieldName.SETCODE, FieldSize.medium));
      this.fieldsMap.set(this.addUnderScore(FieldName.ORGCODE), new SelectSearchField( this.selectedValues.getInstitutionTypeList(), true, FieldName.ORGCODE, FieldSize.medium));
      this.fieldsMap.set(this.addUnderScore(FieldName.ILLFLG), new SelectSearchField( this.selectedValues.getILLParticipationTypeList(), true, FieldName.ILLFLG, FieldSize.medium));
      this.fieldsMap.set(this.addUnderScore(FieldName.STAT), new SelectSearchField( this.selectedValues.getServiceStatusList(), true, FieldName.STAT, FieldSize.medium));
      this.fieldsMap.set(this.addUnderScore(FieldName.GRPCODE), new SelectSearchField( this.selectedValues.getOffsetChargeList(), true, FieldName.GRPCODE, FieldSize.medium));
      this.fieldsMap.set(this.addUnderScore(FieldName.COPYS), new SelectSearchField( this.selectedValues.getCopyServiceTypeList(), true, FieldName.COPYS, FieldSize.medium));
      this.fieldsMap.set(this.addUnderScore(FieldName.LOANS), new SelectSearchField( this.selectedValues.getLendingServiceTypeList(), true, FieldName.LOANS, FieldSize.medium));
      this.fieldsMap.set(this.addUnderScore(FieldName.FAXS), new SelectSearchField( this.selectedValues.getFAXServiceTypeList(), true, FieldName.FAXS, FieldSize.medium));
      if(!this.illService.isObjectEmpty(stickyFields)){
        this.stickyFieldsMap =  this.illService.Json2Map(stickyFields);
        this.setValueToFormControl() 
      }
    });
  }

  private addUnderScore(keyField : String) : String {
    return "_" + keyField + "_";
  }

  getFieldsList() {
    return Array.from(this.fieldsMap.values());
  }

  search() {
    const self = this
    this.stickyFields.forEach(field => {
      self.stickyFieldsMap.set(field, self.fieldsMap.get(field).getFormControl().value);
    });
    concat(
      this.storeService.set(HOLDINGS_SEARCH_FIELDS, this.illService.map2Json(this.stickyFieldsMap))
    ).subscribe();
    this.loading = true;
    let queryParams = this.buildQueryUrl();
    this.clearSelection();
    try {
      this.nacsis.getHoldingsForILLFromNacsis(queryParams)
        .subscribe({
          next: (header) => {
            if (header.status === this.nacsis.OkStatus) {
              this.nacsisHoldingsResultList = header.nacsisRecordList;
              this.localLibraryID = header.FANO;
              this.isBook = (header.type == 'BOOK') ? true : false;
              if (this.nacsisHoldingsResultList != null && this.nacsisHoldingsResultList.length > 0) {
                this.holdings = this.setDisplayDetails(this.nacsisHoldingsResultList);
                this.ngOnChanges(this.holdings);
                this.storeService.set(RESULT_RECORD_LIST_ILL, JSON.stringify(this.holdings)).subscribe();
                this.noHoldingRecords = false;
              } else {
                this.holdings = new Array();
                this.noHoldingRecords = true;
                this.numOfResults = 0;
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

  getFormControlValueByKey(key : String) {
    return this.fieldsMap.get(key).getFormControl().value;
  }

  buildQueryUrl() {
    let urlParams = "";
    urlParams = "nacsisId=" + this.nacsisId;

    this.fieldsMap.forEach((value, key)=> {
      if ( value instanceof SelectSearchField) {
        urlParams = this.buildParamField_selectBox(urlParams, key, this.getFormControlValueByKey(key));
      } else {
        urlParams = this.buildParamField_text(urlParams, key, this.getFormControlValueByKey(key));
      }
    });
   
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
         //Patch for URM-192029 :
      const reducedArray = new Array();
      if(fieldName === "_KENCODE_") { 
        valueArr.forEach(value => {
          value = value.split(',');
          reducedArray.push(value);
        });
        valueArr = new Set(reducedArray.reduce( ( a, c ) => a.concat( [...c] ), [] ) )
      }
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
    this.storeService.remove(HOLDINGS_SEARCH_FIELDS).subscribe(()=>{
      this.stickyFieldsMap = new Map();
      this.ngOnInit();
      this.holdings = new Array();
      this.panelState = true;
      this.selected = "0";
      this.selectedVolMap = new Map();
      this.holdings = new Array();
      }
    );
   
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

      holding.regionCode = nacsisHoldingsResult.KENCODE;
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
      holding.memberinfo = [];
      this.holdings.push(holding);
    });
    
    return this.holdings;
  }

  convertMapping(code: any, tag: string) {
    let name = '';
    let paramsMap = new Map();
    switch (tag) {
      case 'KENCODE':
        paramsMap = this.fillParamMapWithTypeList(paramsMap, this.illService.regionCodeList);
        break;
      case 'SETCODE':
        paramsMap = this.fillParamMapWithTypeList(paramsMap, this.illService.establisherTypeResult);
        break;
      case 'ORGCODE':
        paramsMap = this.fillParamMapWithTypeList(paramsMap, this.illService.institutionTypeResult);
        break;
      case 'CATFLG':
        paramsMap = this.fillParamMapWithTypeList(paramsMap, this.illService.iLLParticipationTypeResult);
        break;

      case 'COPYS':
        paramsMap = this.fillParamMapWithTypeList(paramsMap, this.illService.copyServiceTypeResult);
        break;

      case 'FAXS':
        paramsMap = this.fillParamMapWithTypeList(paramsMap, this.illService.fAXServiceTypeResult);
        break;

      case 'GRPCODE':
        paramsMap = this.fillParamMapWithTypeList(paramsMap, this.illService.offsetCodeTypeResult);
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
          bookHolDetail.VOL = this.illService.isEmpty(nacsisHolding.VOL) ? '' : nacsisHolding.VOL;
          bookHolDetail.RGTN = this.illService.isEmpty(nacsisHolding.RGTN) ? '' : nacsisHolding.RGTN;
          bookHolDetail.LDF = this.illService.isEmpty(nacsisHolding.LDF) ? '' : nacsisHolding.LDF;
          if (!this.illService.isEmpty(bookHolDetail.VOL)) {
            fieldArr.push(bookHolDetail);
          }
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
          fieldValue = this.illService.isEmpty(nacsisHolding.HLV) ? '' : nacsisHolding.HLV;
          break;
        case 'hlyr':
          fieldValue = this.illService.isEmpty(nacsisHolding.HLYR) ? '' : nacsisHolding.HLYR;
          break;
        case 'cln':
          fieldValue = this.illService.isEmpty(nacsisHolding.CLN) ? '' : nacsisHolding.CLN;
          break;
        case 'ldf':
          fieldValue = this.illService.isEmpty(nacsisHolding.LDF) ? '' : nacsisHolding.LDF;
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
        });
      }
    } else if (row.checked === false) {
      this.isMaxRowSelected = false;
      this.selecedData = this.selecedData.filter(el => {
        return el.index !== row.index;
      });
      this.fillIndexIntoArray(this.selecedData);
    }
  }

  fillIndexIntoArray(selecedData) {
    this.selectedIndex = new Array();
    selecedData.forEach(element => {
      this.selectedIndex.push(element.index);
    });
  }

  filterSelectVol(rows) {
    let newIndex: number = 1;
    rows.forEach(row => {
      let rowIndex = row.index;
      let volIndexSelected = this.selectedVolMap.get(rowIndex);
      if (!this.illService.isEmpty(volIndexSelected)) {
        let vol = new Array();
        vol = row.vol;
        row.vol = vol.filter(obj => {
          return obj.index == volIndexSelected;
        })
      } else {
        row.vol = new Array();
      }
      row.index = newIndex;
      newIndex++;
    });
    return rows;
  }

  maxReached(): boolean {
    return this.selecedData.length === 5;
  }


  getActionMenu() {
    return this.ACTIONS_MENU_LIST;
  }

  onActionsClick(expandedElement, element, actionIndex) {

    switch (actionIndex) {
      case 0: // view holding
        this.isViewHolding = true;
        return expandedElement === element ? null : element;

      case 1: // view member info
        this.setMemberInfo(element.fano);
        this.isViewHolding = false;
        return expandedElement === element ? null : element;
    }
  }

  setMemberInfo(fano){
    let obj = [];
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
          this.setSearchResultsDisplay(obj);
          this.loading = false;
        }
      });
    } catch (e) {
      this.loading = false;
      this.alert.error(this.translate.instant('General.Errors.generalError'), { keepAfterRouteChange: true });
    }
  }

  convertMemberInfo(header, obj) {
    header.records.forEach(record => {
      if(!this.illService.isEmpty(record.KENCODE))
      record.KENCODE = this.convertMapping(record.KENCODE, "KENCODE") + "(" + record.KENCODE + ")";
      if(!this.illService.isEmpty(record.SETCODE))
      record.SETCODE = this.convertMapping(record.SETCODE, "SETCODE") + "(" + record.SETCODE + ")";
      if(!this.illService.isEmpty(record.ORGCODE))
      record.ORGCODE = this.convertMapping(record.ORGCODE, "ORGCODE") + "(" + record.ORGCODE + ")";
      if(!this.illService.isEmpty(record.CATFLG))
      record.CATFLG = this.convertMapping(record.CATFLG, "CATFLG") + "(" + record.CATFLG + ")";
      if(!this.illService.isEmpty(record.ILLFLG))
      record.ILLFLG = this.convertMapping(record.ILLFLG, "CATFLG") + "(" + record.ILLFLG + ")";
      if(!this.illService.isEmpty(record.COPYS))
      record.COPYS = this.convertMapping(record.COPYS, "COPYS") + "(" + record.COPYS + ")";
      if(!this.illService.isEmpty(record.LOANS))
      record.LOANS = this.convertMapping(record.LOANS, "COPYS") + "(" + record.LOANS + ")";
      if(!this.illService.isEmpty(record.FAXS))
      record.FAXS = this.convertMapping(record.FAXS, "FAXS") + "(" + record.FAXS + ")";
      if(!this.illService.isEmpty(record.STAT))
      record.STAT = this.convertMapping(record.STAT, "FAXS") + "(" + record.STAT + ")";
      if(!this.illService.isEmpty(record.GRPCODE))
      record.GRPCODE = this.convertMapping(record.GRPCODE, "GRPCODE") + "(" + record.GRPCODE + ")";
      obj.push(record);
    });
    return obj;
  }

  onVolSelected(vol, element) {
    let selectedVolIndex = vol.value;
    let selectedEleIndex = element.index;
    this.selectedVolMap.set(selectedEleIndex, selectedVolIndex);
  }

  isShowVolValue(element) {
    if (this.illService.isEmpty(element.vol)) {
      return false;
    } else {
      if (element.vol.length > 0) {
        return true;
      } else {
        return false;
      }
    }
  }

  setVolValue(element) {
    if (element != null && element != undefined && element.vol != null && element.vol != undefined) {
      if (element.vol.length == 1) {
        let selectedEleIndex = element.index;
        this.selectedVolMap.set(selectedEleIndex, element.vol[0].index);
        return element.vol[0].index;
      }
    }
  }


  onOwnerSelected() {
    this.clearSelection();
    this.storeService.set(this.nacsis.OwnerKey, this.selected).subscribe();
    this.storeService.get(RESULT_RECORD_LIST_ILL).subscribe((holdings)=>{
      if(!this.illService.isEmpty(holdings)){
        this.holdings =  JSON.parse(holdings);
      }else{
        this.holdings = this.setDisplayDetails(this.nacsisHoldingsResultList);
      }
      if (this.selected === '0') {
        this.noHoldingRecords = false;
        this.ngOnChanges(this.holdings);
      } else if (this.selected === '1') {
        let localnacsisHoldingsResultList = this.holdings.filter(e => e.fano === this.localLibraryID);
        this.holdings = localnacsisHoldingsResultList;
        if (localnacsisHoldingsResultList.length == 0) {
          this.noHoldingRecords = true;
        }else{
          this.ngOnChanges(localnacsisHoldingsResultList);
        }
      }
    });
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
    this.selectedVolMap = new Map();
  }

  formatDate(dateTime: string) {
    if (!this.illService.isEmpty(dateTime) && dateTime.length == 8) {
      return dateTime.substring(0, 4) + "/" + dateTime.substring(4, 6) + "/" + dateTime.substring(6, 8);
    }
    return dateTime;
  }

  private setSearchResultsDisplay(memberinfo) {

    this.illService.setSearchMemberDBResultsMap(this.currentSearchType, memberinfo);

    this.catalogResultsData = this.illService.getSearchResults(this.currentSearchType);
    this.resultsSummaryDisplay = new Array();
    this.catalogResultsData.getResults()?.forEach(result => {
      this.resultsSummaryDisplay.push(result.getSummaryDisplay());
    });

    if (this.resultsSummaryDisplay.length > 0) {
      let record = this.resultsSummaryDisplay[0];
      this.resultFullDisplay = record.getFullRecordData().getFullViewDisplay().initContentDisplay();
    } else {
      this.resultFullDisplay = null;
    }
  }


  isEvenRow(i: number) {
    if (i % 2 != 0) {
      return "expand-tr";
    }
  }

  fillRowsTillFive(rows){
    if(rows.length == 5){
      return rows;
    }else{
      console.log(rows);
      let maxIndex = rows.length;
      while(maxIndex < 5){
        let emptyRow = new DisplayHoldingResult();
        emptyRow.index = maxIndex+1;
        rows.push(emptyRow);
        maxIndex++;
      }
      console.log(rows);
      return rows;
    }
  }


  next() {
    this.filterSelectVol(this.selecedData);
    this.fillRowsTillFive(this.selecedData);
    this.router.navigate(['requestForm', this.nacsisId, this.mmsTitle, this.routerSearchType]);
    concat(
      this.storeService.set(SELECTED_RECORD_LIST_ILL, JSON.stringify(this.selecedData)),
      this.storeService.set(ROUTING_STATE_KEY, AppRoutingState.HoldingSearchMainPage)
    ).subscribe();  }

  backToSearchRecord() {
    concat(
      this.storeService.set(ROUTING_STATE_KEY, AppRoutingState.ILLBorrowingMainPage),
      this.storeService.set(RESULT_RECORD_LIST_ILL, ''),
    ).subscribe();
    this.router.navigate(['searchRecord', 'back']);
  }

  private initConfigColMap(): void {
    this.columnsList.forEach((val: string) => {
      this.configColMap.set(val, false);
    })
  }

  restoreColumnDefault() {
    this.columnsList.forEach(col => {
      this.columns[col] = true;
    });
    this.storeService.set(HOLDINGS_COLUMNS, JSON.stringify(this.columns)).subscribe();
  }

  saveConfigToStore(event) {
    this.storeService.set(HOLDINGS_COLUMNS, JSON.stringify(this.columns)).subscribe();
   }

   getConfigLabel(event) {
    return this.translate.instant('ILL.HoldingSearchResult.' + event);
   }
}
