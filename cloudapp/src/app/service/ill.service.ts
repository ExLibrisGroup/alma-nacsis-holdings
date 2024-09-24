import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SearchType, FieldName } from '../user-controls/search-form/search-form-utils';
import { HttpClient } from "@angular/common/http";
import { mergeMap } from 'rxjs/operators';
import { CloudAppEventsService, CloudAppStoreService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { BaseService, QueryParams, SELECTED_INTEGRATION_PROFILE } from "./base.service";

@Injectable({
  providedIn: 'root'
})
export class IllService extends BaseService {

  recordInfoList: AlmaRecordInfo[] = new Array();
  recordsSummaryDisplay: Array<IDisplayLines>;
  almaResultsData: AlmaRecordsResults;
  almaRecord: AlmaRecord = new AlmaRecord('', this.translate, this);
  baseRecordInfoList: Array<BaseRecordInfo> = new Array();
  localMemberInfo: any[];

  public currentSearchType: SearchType = SearchType.Monographs;

  constructor(
    protected eventsService: CloudAppEventsService,
    protected storeService: CloudAppStoreService,
    protected http: HttpClient,
    protected translate: TranslateService
  ) {
    super(eventsService, storeService, http);
  }



  recordFillIn(illBorrowing: AlmaRecord, record: AlmaRequestInfo) {
    illBorrowing.title = this.isEmpty(record.title) ? "" : record.title;
    illBorrowing.author = this.isEmpty(record.author) ? "" : record.author;
    illBorrowing.place_of_pub = this.isEmpty(record.place_of_pub) ? "" : record.place_of_pub;
    illBorrowing.name_of_pub = this.isEmpty(record.name_of_pub) ? "" : record.name_of_pub;
    illBorrowing.date_of_pub = this.isEmpty(record.date_of_pub) ? "" : record.date_of_pub;

    illBorrowing.language = this.isEmpty(record.language) ? "" : record.language;
    illBorrowing.nacsisId = this.isEmpty(record.nacsisId) ? "" : record.nacsisId;
    illBorrowing.isbn = this.isEmpty(record.isbn) ? "" : record.isbn;
    illBorrowing.issn = this.isEmpty(record.issn) ? "" : record.issn;
    illBorrowing.exrernalId = this.isEmpty(record.exrernalId) ? "" : record.exrernalId;
    illBorrowing.volumes = this.isEmpty(record.volumes) ? null : record.volumes;

    illBorrowing.seriesSummaryAll = this.isEmpty(record.seriesSummaryAll) ? "" : record.seriesSummaryAll;
  }

  setFormValue(item: AlmaRecordDisplay) {
    let urlParams = "";
    urlParams = urlParams + QueryParams.PageIndex + "=0&" + QueryParams.PageSize + "=20";

    if (this.isSerial(item.record.nacsisId)) {
      this.currentSearchType = SearchType.Serials;
    }

    urlParams = urlParams + "&" + QueryParams.SearchType + "=" + this.currentSearchType;

    urlParams = urlParams + "&" + FieldName.TITLE;
    urlParams = urlParams + "=" + item.record.title;

    urlParams = urlParams + "&" + FieldName.ID;
    urlParams = urlParams + "=" + item.record.nacsisId;

    urlParams = urlParams + "&" + FieldName.ISBN;
    urlParams = urlParams + "=" + item.record.isbn;

    urlParams = urlParams + "&" + FieldName.ISSN;
    urlParams = urlParams + "=" + item.record.issn;



    return urlParams;
  }

  isSerial(nacsisID: string): boolean {
    //true is default:Monographs, false is Serials
    if (this.isEmpty(nacsisID)) {
      return false;
    } else {
      if (nacsisID.substring(0, 2) === "AA" || nacsisID.substring(0, 2) === "AN") {
        return true;
      } else if (nacsisID.substring(0, 2) === "BA" || nacsisID.substring(0, 2) === "BB" || nacsisID.substring(0, 2) === "BN") {
        return false;
      }
    }
    return false;
  }

  setBaseUrl(initData: InitData): string {
    let baseUrl = super.setBaseUrl(initData);
    baseUrl = baseUrl + "createIllRequest?";
    return baseUrl;
  }

  createILLrequest(requestBody) {
    let fullUrl: string;
    let body = JSON.stringify(requestBody);
    let database = requestBody[0].database;
    let queryParams= "dataBase=" + database;
    
    console.log(body);
    return this.getInitData().pipe(
      mergeMap(initData => {
        fullUrl = this.setBaseUrl(initData);
        return this.storeService.get(SELECTED_INTEGRATION_PROFILE);
        }),
      mergeMap(profile => {
          let parsedProfile = JSON.parse(profile);
          fullUrl += "rsLibraryCode=" + parsedProfile.rsLibraryCode + "&" +  queryParams;
          return this.getAuthToken()
        }),
      mergeMap(authToken => {
        let headers = this.setAuthHeader(authToken);
        return this.http.post<any>(fullUrl, body, { headers });
      })
    );
  }

}



export class AlmaRecordInfo {
  title: string = "";
  author: string = "";
  place_of_pub: string = "";
  name_of_pub: string = "";
  date_of_pub: string = "";
  language: string = "";
  nacsisId: string = "";
  isbn: string = "";
  issn: string = "";
  seriesSummaryAll: string = "";
  volumes?: string[];
}

export class AlmaRequestInfo extends AlmaRecordInfo {
  exrernalId: string = "";
}


export abstract class IDisplayLines {

  protected baseRecord: BaseRecordInfo;

  constructor(viewRecord: BaseRecordInfo) {
    this.baseRecord = viewRecord;
  }

  getDisplayTitle(): any { };
  initContentDisplay(): any { };
}

export abstract class BaseRecordInfo {
  title: string = "";
  author: string = "";
  place_of_pub: string = "";
  name_of_pub: string = "";
  date_of_pub: string = "";
  language: string = "";
  nacsisId: string = "";
  isbn: string = "";
  issn: string = "";
  exrernalId: string = "";
  volumes?: string[];

  seriesSummaryAll: string = "";
  summaryDisplay: IDisplayLines;

  constructor(
    record: any,
    protected translate: TranslateService
  ) {
    this.title = record.title;
    this.author = record.author;
    this.place_of_pub = record.place_of_pub;
    this.name_of_pub = record.name_of_pub;

    this.date_of_pub = record.date_of_pub;
    this.language = record.language;
    this.nacsisId = record.nacsisId;
    this.isbn = record.isbn;
    this.issn = record.issn;
    this.volumes = record.volumes;

    this.seriesSummaryAll = record.seriesSummaryAll;
  }

  getTitle() {
    return this.title;
  }

  getAuthor() {
    return this.author;
  }

  getPlace_of_pub() {
    return this.place_of_pub;
  }

  getName_of_pub() {
    return this.name_of_pub;
  }


  getDate_of_pub() {
    return this.date_of_pub;
  }

  getLanguage() {
    return this.language;
  }

  getNacsisId() {
    return this.nacsisId;
  }

  getIsbn() {
    return this.isbn;
  }

  getIssn() {
    return this.issn;
  }


  getSeriesSummaryAll() {
    return this.seriesSummaryAll;
  }

  abstract getSummaryDisplay(): IDisplayLines;

}

export class AlmaRecordsResults {

  results: Array<BaseRecordInfo>;

  constructor() { }

  getResults() {
    return this.results;
  }

  setResults(arr: Array<BaseRecordInfo>) {
    this.results = arr;
  }
}

export class AlmaRecord extends BaseRecordInfo {


  summaryView: AlmaRecordInfo;
  moduleType: string

  constructor(
    record: any,
    translate: TranslateService,
    private illService: IllService,
  ) {
    super(record, translate);
  }
  getSummaryDisplay() {
    return new AlmaRecordDisplay(this.translate, this, this.illService, this.moduleType);
  }

}

export class AlmaRecordDisplay extends IDisplayLines {
  record: AlmaRequestInfo;
  type: string;

  constructor(
    private translate: TranslateService,
    fullRecordData: BaseRecordInfo,
    private illService: IllService,
    moduleType: string
  ) {
    super(fullRecordData);
    this.record = fullRecordData;
    this.type = moduleType;
  }

  displayRadioButton() {
    let str = 'block';
    if (this.type === 'holding' && this.illService.isEmpty(this.record.nacsisId))
      str = 'none';
    return { 'display': str };
  }

  getNacsisID(): string {
    return this.record.nacsisId;
  }

  getDisplayTitle(): string {
      return this.record.title;
  }

  initContentDisplay(): Array<string> {
    let summaryLines = new Array<string>();
      let authorDisPlay = "", publicInfo = "";
      if (!this.illService.isEmpty(this.record.author)) {
        authorDisPlay = this.translate.instant('ILL.DisplayCard.By') + " " + this.record.author;
      }

      if (!this.illService.isEmpty(this.record.place_of_pub) || !this.illService.isEmpty(this.record.name_of_pub) 
        || !this.illService.isEmpty(this.record.date_of_pub) || !this.illService.isEmpty(this.record.volumes)) {
        publicInfo = " (" ;
      }

      if (!this.illService.isEmpty(this.record.place_of_pub)) {
        publicInfo = publicInfo + this.record.place_of_pub;
      }

      if (!this.illService.isEmpty(this.record.name_of_pub)) {
        publicInfo = publicInfo + ": " + this.record.name_of_pub;
      }

      if (!this.illService.isEmpty(this.record.date_of_pub)) {
        publicInfo = publicInfo + ", " + this.record.date_of_pub;
      }

      if (!this.illService.isEmpty(this.record.volumes)) {
        if(this.record.volumes.length === 1) {
          publicInfo = publicInfo + "; " + this.record.volumes[0];
        } else {
          publicInfo = publicInfo + "; " + this.record.volumes[0] + " - " + this.record.volumes[this.record.volumes.length-1];
        }
      }

      if(!this.illService.isEmpty(publicInfo)) {
        publicInfo = publicInfo + ")"
      }

      if (!this.illService.isEmpty(authorDisPlay) || !this.illService.isEmpty(publicInfo)) {
        summaryLines.push(authorDisPlay + publicInfo);
      }

      if (!this.illService.isEmpty(this.record.language))
        summaryLines.push(this.translate.instant("ILL.DisplayCard.Language") + ": " + this.record.language);

      if (!this.illService.isEmpty(this.record.isbn))
        summaryLines.push(this.translate.instant("ILL.DisplayCard.ISBN") + ": " + this.record.isbn );

      if (!this.illService.isEmpty(this.record.issn))
        summaryLines.push(this.translate.instant("ILL.DisplayCard.ISSN") + ": " + this.record.issn);
     
        if (!this.illService.isEmpty(this.record.nacsisId))
        summaryLines.push(this.translate.instant("ILL.DisplayCard.NACSIS_ID") + ": " + this.record.nacsisId);

        if (!this.illService.isEmpty(this.record.seriesSummaryAll))
        summaryLines.push(this.record.seriesSummaryAll);
    return summaryLines;
  }
}