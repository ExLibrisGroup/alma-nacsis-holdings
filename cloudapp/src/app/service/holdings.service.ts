import { HttpClient } from "@angular/common/http";
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';
import { CloudAppEventsService, CloudAppStoreService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { BaseService, SELECTED_INTEGRATION_PROFILE } from "./base.service";

@Injectable({
  providedIn: 'root'
})
export class HoldingsService extends BaseService {
  private _holdings: Holding[];
  private _header: Header;
  private PREVIEW_MAX_LENGTH: number = 30;

  constructor(
    protected eventsService: CloudAppEventsService,
    protected storeService: CloudAppStoreService,
    protected http: HttpClient
  ) {
    super(eventsService, storeService, http);
  }

  setBaseUrl(initData: InitData) : string {
    let baseUrl = super.setBaseUrl(initData);
    baseUrl = baseUrl + "holdings?";
    return baseUrl;
  }

  getHeader(): Header {
    return this._header;
  }

  getHoldingsFromNacsis(nacsisId: any, owner: String){

    let fullUrl: string;
    let queryParams= "&nacsisId=" + nacsisId + "&owner=" + owner;
    
    return this.getInitData().pipe(
      mergeMap(initData => {
        fullUrl = this.setBaseUrl(initData);
        return this.storeService.get(SELECTED_INTEGRATION_PROFILE);
      }),
      mergeMap(profile => {
          let parsedProfile = JSON.parse(profile);
          fullUrl += "rsLibraryCode=" + parsedProfile.rsLibraryCode +  queryParams;
          console.log(fullUrl);
          return this.getAuthToken()
      }),
      mergeMap(authToken => {
        let headers = this.setAuthHeader(authToken);
        return this.http.get<any>(fullUrl, { headers })}),
      mergeMap(response => {
        console.log(response);
        this._header = response;
        this._holdings = response.nacsisRecordList;
        if (this._header.status === this.OkStatus && !this.isEmpty(this._holdings)) {
          this.updateHoldingPreview();
        }
        return of(this._header);
      })
    );
  }

  getHoldingsForILLFromNacsis(queryParams: String){

    let fullUrl: string;
    return this.getInitData().pipe(
      mergeMap(initData => {
        fullUrl = this.setBaseUrl(initData);
        return this.storeService.get(SELECTED_INTEGRATION_PROFILE);
      }),
      mergeMap(profile => {
          let parsedProfile = JSON.parse(profile);
          fullUrl += "rsLibraryCode=" + parsedProfile.rsLibraryCode + "&" +  queryParams;
          console.log(fullUrl);
          return this.getAuthToken()
      }),
      mergeMap(authToken => {
        let headers = this.setAuthHeader(authToken);
        return this.http.get<any>(fullUrl, { headers })}),
      mergeMap(response => {
        console.log(response);
        this._header = response;
        this._holdings = response.nacsisRecordList;
        if (this._header.status === this.OkStatus && !this.isEmpty(this._holdings)) {
          this.updateHoldingPreview();
        }
        return of(this._header);
      })
    );
  }

  getHolding(id: string): Holding {
    return this._holdings.find(holding => holding.ID === id);
  }

  getHoldingList(): Holding[] {
    return this._holdings;
  }

  updateHoldingPreview() {
    this._holdings.forEach(holding => {
      holding.libraryFullName = holding.LIBABL + ' (' + holding.FANO + ')';
      var size = holding.nacsisHoldingsList.length;
      holding.info = '';

      if (size == 1) {
        Object.values(holding.nacsisHoldingsList[0]).forEach((element) => {
          if (!this.isEmpty(element)) {
            holding.info = holding.info + ' ' + element;
          }
        });
      } else if (size <= 3) {
        holding.nacsisHoldingsList.forEach((element, index) => {
          var vol = element.VOL;

          if (!this.isEmpty(vol)) {
            if (index == 0) {
              holding.info = vol;
            } else {
              holding.info = holding.info + ', ' + vol;
            }
          }
        });
      } else {
        var vol0 = holding.nacsisHoldingsList[0].VOL;
        var voln = holding.nacsisHoldingsList[holding.nacsisHoldingsList.length - 1].VOL;
        holding.info = vol0 + ' - ' + voln;
      }
      // limit preview up to 30 characters + ...
      if(!this.isEmpty(holding.info) && holding.info.length > this.PREVIEW_MAX_LENGTH) {
        holding.info = holding.info.substr(0, 30) + '...';
      }
    });
  }

  deleteHoldingFromNacsis(nacsisId: string, holdingsId: string) {
    
    let fullUrl: string;
    let queryParams = "&nacsisId=" + nacsisId + '&holdingId=' + holdingsId;

    return this.getInitData().pipe(
      mergeMap(initData => {
        fullUrl = this.setBaseUrl(initData); 
        return this.storeService.get(SELECTED_INTEGRATION_PROFILE);
      }),
      mergeMap(profile => {
          let parsedProfile = JSON.parse(profile);
          fullUrl += "rsLibraryCode=" + parsedProfile.rsLibraryCode +  queryParams;
          console.log(fullUrl);
          return this.getAuthToken()
      }),
      mergeMap(authToken => {
        let headers = this.setAuthHeader(authToken);
        return this.http.delete<any>(fullUrl, { headers });
      })
    );
  }

  deleteHolding(holdingId: string) {
    const index = this._holdings.findIndex(holding => holding.ID === holdingId);
    if (index > -1) {
      this._holdings.splice(index, 1);
      this.updateHoldingPreview();
    }
  }

  saveHoldingToNacsis(nacsisId: string, holding: Holding) {
  
    let fullUrl: string;
    let queryParams = "&nacsisId=" + nacsisId;
    let body = JSON.stringify(holding);

    return this.getInitData().pipe(
      mergeMap(initData => {
        fullUrl = this.setBaseUrl(initData);
        return this.storeService.get(SELECTED_INTEGRATION_PROFILE);
      }),
      mergeMap(profile => {
          let parsedProfile = JSON.parse(profile);
          fullUrl += "rsLibraryCode=" + parsedProfile.rsLibraryCode + queryParams;
          console.log(fullUrl);
          return this.getAuthToken()
      }),
      mergeMap(authToken => {
        let headers = this.setAuthHeader(authToken);
        if (this.isEmpty(holding.ID)) { // create/POST
          return this.http.post<any>(fullUrl, body, { headers });
        } else { // update/PUT 
          fullUrl = fullUrl + '&holdingId=' + holding.ID;
          return this.http.put<any>(fullUrl, body, { headers });
        }
      })
    );
  }

  saveHolding(holding: Holding) {
    if (!this._holdings) {
      this._holdings = [];
    }
    let existHolding = this._holdings.find(thisHolding => thisHolding.ID === holding.ID);
    if (existHolding) {
      existHolding = holding;
    } else {
      this._holdings.push(holding);
    }
    this.updateHoldingPreview();
  }
}

export class Header {
  status: string = ""
  errorMessage: string = ""
  BID: string = ""
  holdingId = ""
  FANO: string = "" // library id
  LIBABL: string = "" // library name
  type: string = "" // BOOK/SERIAL
  nacsisRecordList: any[];
}

export class Holding {
  ID: string = "";
  CRTDT: string = "";
  RNWDT: string = "";
  BID: string = "";
  description: string = "";
  LIBABL: string = "";
  FANO: string = "";
  LOC: string = "";
  ill: boolean = false;
  libraryFullName: string;
  info: string;
  nacsisHoldingsList: any[];
  editable: boolean;
  type: string;
  ltrList: string[];
}

export class HoldingsBook {
  VOL: string = "";
  CLN: string = "";
  RGTN: string = "";
  CPYR: string = "";
  CPYNT: string = "";
  LDF: string = "";
}

export class HoldingsSerial {
  HLYR: string = "";
  HLV: string = "";
  CONT: string = "";
  CLN: string = "";
  LDF: string = "";
  CPYNT: string = "";
}

export class HoldingsSearch {
  nacsisId:string = "";//Nacsis id
  FANO: string = ""; //Participating organization code
  VOL: string = ""; //Volume
  YEAR:string = ""; //Year
  LOC: string = "";//Location
  _KENCODE_: string = ""; //Region (prefecture) code
  _SETCODE_: string = ""; //Establisher type
  _ORGCODE_: string = ""; //Institution type
  _GRPCODE_: string = ""; //Offset charge
  _ILLFLG_: string = ""; //ILL participation type
  _STAT_: string = ""; //Service status
  _COPYS_: string = ""; //Copy service type
  _LOANS_: string = ""; //Lending service type
  _FAXS_: string = ""; //FAX service type
  owner: string = ""; //Owner
}

export class NacsisHoldingRecord{
  BID: string = "";
  COPYS: string = "";
  CRTDT: string = "";
  FANO: string = "";
  FAXS: string = "";
  GRPCODE: string = "";
  ID: string = "";
  ILLFLG: string = "";
  KENCODE: string = "";
  LIBABL: string = "";
  LOANS:string = "";
  LOC: string = "";
  SUM:string="";
  ORGCODE: string = "";
  RNWDT: string = "";
  SETCODE: string = "";
  STAT:string = "";
  editable: boolean = false;
  info: string = "";
  libraryFullName: string = "";
  nacsisHoldingsList: any[];
  type: string = "";
}

export class volDetails {
  
}

export class NacsisBookHoldingsListDetail {
  index:number;
  VOL: string = "";
  CLN: string = "";
  RGTN: string = "";
  CPYR: string = "";
  LDF: string = "";
  CPYNT: string = "";
}

export class NacsisSerialHoldingsListDetail {
  index:number;
  HLYR: string = "";
  HLV: string = "";
  CONT: string = "";
  CLN: string = "";
  LDF: string = "";
  CPYNT: string = "";
}

export class DisplayHoldingResult{
  index: number;
  name: string = "";
  vol: any[];//book only
  hlv: string = "";//serial only
  hlyr: string = "";//serial only
  cln: string = "";//serial only
  ldf: string = "";//serial only
  region: string = "";
  establisher: string = "";
  institutionType: string = "";
  fee: string = "";
  location : string = "";
  photoCopy_fee : string = "";
  ill : string = "";
  stat : string = "";
  photoCopy  : string = "";
  loan : string = "";
  fax : string = "";
  isSelected:boolean = false;
  id: string = "";
  crtdt: string = "";
  rnwdt : string = "";
  fano : string = "";
  memberinfo:any[];
}


const HOLDINGS = [
  {
    "ID": "holding1",
    "BID": "BID1",
    "description": "Main holding",
    "LIBABL": "Main",
    "LOC": "Stacks",
    "FANO": "fano1",
    "ill": true,
    "libraryFullName": "Main (fano1)",
    "info": "info1"
  },
  {
    "ID": "holding2",
    "BID": "BID2",
    "description": "Reading room",
    "LIBABL": "RR",
    "LOC": "Room",
    "FANO": "fano2",
    "ill": false,
    "libraryFullName": "RR (fano2)",
    "info": "info2"
  }
];
