import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SearchType, SearchField, FieldName } from '../user-controls/search-form/search-form-utils';
import { HttpClient } from "@angular/common/http";
import { mergeMap } from 'rxjs/operators';
import { CloudAppEventsService, CloudAppStoreService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { HoldingsService } from '../service/holdings.service';
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

  regionCodeList: string[] = [
    '01 北海道', '02 青森', '03 岩手', '04 宮城', '05 秋田', '06 山形',
    '07 福島', '08 茨城', '09 栃木', '10 群馬', '11 埼玉', '12 千葉',
    '13 東京', '14 神奈川', '15 新潟', '16 富山', '17 石川', '18 福井',
    '19 山梨', '20 長野', '21 岐阜', '22 静岡', '23 愛知', '24 三重',
    '25 滋賀', '26 京都', '27 大阪', '28 兵庫', '29 奈良', '30 和歌山',
    '31 鳥取', '32 島根', '33 岡山', '34 広島', '35 山口', '36 徳島',
    '37 香川', '38 愛媛', '39 高知', '40 福岡', '41 佐賀', '42 長崎',
    '43 熊本', '44 大分', '45 宮崎', '46 鹿児島', '47 沖縄', 'なし 全国'
  ];
  

  establisherTypeResult: string[] = [
    '1 国立', '2 公立', '3 私立', '4 特殊法人', '5 海外', '8 研修・テスト用', '9 その他'
  ];
  institutionTypeResult: string[] = [
    '1 大学', '2 短期大学', '3 高等専門学校', '4 大学共同利用機関等', '5 他省庁の施設機関等', '8 研修・テスト用', '9 その他'
  ];
  iLLParticipationTypeResult: string[] = [
    'A 参加', 'N 未参加'
  ];

  copyServiceTypeResult: string[] = [
    'A 受け付ける', 'N 受け付けない', 'C 他の窓口で受け付ける'
  ];

  fAXServiceTypeResult: string[] = [
    'A サービス可', 'N サービス不可', 'C 条件付でサービス可'
  ];

  offsetCodeTypeResult: string[] = [
    'N ILL文献複写等料金相殺サービス参加'
  ];


  constructor(
    protected eventsService: CloudAppEventsService,
    protected storeService: CloudAppStoreService,
    protected http: HttpClient,
    private nacsis: HoldingsService,
    protected translate: TranslateService
  ) {
    super(eventsService, storeService, http);
  }

  isEmpty(val) {
    return (val === undefined || val == null || val.length <= 0) ? true : false;
  }

  
  isObjectEmpty(obj) {
    return obj === undefined || obj === null || JSON.stringify(obj) === '"{}"';
  }

  map2Json(map) {
    let jsonObject = {};
    map.forEach((value, key) => {
      jsonObject[key] = value;
    });
    return JSON.stringify(jsonObject);
  }

  Json2Map(jsonObject) {
    let map = new Map();
    jsonObject = JSON.parse(jsonObject);
    for (var value in jsonObject) {
      map.set(value, jsonObject[value]);
    }
    return map;
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

export class RequestFields {
  ID: string[];
  _DBNAME_: string[];
  CRTDT: string[];
  RNWDT: string[];
  CRTUID: string[];
  RNWUID: string[];  
  BSFLG: string[];
  STAT: string[];
  ONO: string[];
  ANO: string[];
  CLAIMFLG: string[];
  LOANFLG: string[];
  ODATE: string[];
  ADATE: string[];
  SDATE: string[];
  RDATE: string[];
  DDATE: string[];
  BDATE: string[];  
  KDATE: string[];
  OMLID: string[];
  OMLNM: string[];
  AMLID: string[];
  AMLNM: string[];
  CLNT: string[];
  CLNTP: string[];
  SRVCE: string[];
  VLNO: string[];
  PAGE: string[];
  YEAR: string[];  
  ARTCL: string[];
  BVRFY: string[];
  HVRFY: string[];
  ACCT: string[];
  TYPE: string[];
  FEE: string[];
  POSTG: string[];
  SUM: string[];
  SPVIA: string[];
  PRMT: string[];
  OSTAF: string[];
  ASTAF: string[];
  OLDF: string[];
  OLDAF: string[];
  ALDF: string[];
  OADRS: string[];
  AADRS: string[];
  IRUID: string[];
  OMLIDS: string[];
  AMLIDS: string[];
  _COMMENT_: string[];
  EXTERNAL_ID: string = "";

  BIBG: BIBG[];
  HMLG: HMLG[];
  SENDG : SENDG[];
  CHG : CHG[];
}

export class BIBG {
  BIBID: string = "";
  BIBNT: string = "";
  STDNO: string = "";
}

export class HMLG {
  HMLID: string = "";
  HMLNM: string = "";
  LOC: string = "";
  VOL: string = "";
  CLN: string = "";
  RGTN: string = "";
}

export class SENDG {
  SENDCMND: string = "";
  SENDMLID: string = "";
  SENDCMNT: string = "";
}

export class CHG {
  ITEM: string = "";
  UPRCE: string = "";
  QNT: string = "";
  CHRGE: string = "";

}


