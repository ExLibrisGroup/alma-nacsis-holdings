import { HttpClient } from "@angular/common/http";
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';


import { BaseService } from "./base.service";

@Injectable({
  providedIn: 'root'
})
export class HoldingsService extends BaseService {
  private _holdings: Holding[];
  private _header: Header;
  public OwnerKey: string = 'OWNER_KEY';
  private PREVIEW_MAX_LENGTH: number = 30;

  constructor(
    protected http: HttpClient,
    protected eventsService: CloudAppEventsService
  ) {
    super(eventsService, http);
  }

  setBaseUrl(initData: InitData) : string {
    let baseUrl = super.setBaseUrl(initData);
    // baseUrl = baseUrl + "holdings/";
    return baseUrl;
  }

  getHeader(): Header {
    return this._header;
  }

  getHoldingsFromNacsis(mmsId: any, owner: String){

    let fullUrl: string;
    
    return this.getInitData().pipe(
      mergeMap(initData => {
        fullUrl = this.setBaseUrl(initData) + mmsId + "?owner=" + owner;
        return this.getAuthToken()}),
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

  deleteHoldingFromNacsis(mmsId: string, holdingsId: string) {
    
    let fullUrl: string;
    
    return this.getInitData().pipe(
      mergeMap(initData => {
        fullUrl = this.setBaseUrl(initData) + mmsId + '/' + holdingsId;
        return this.getAuthToken()}),
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

  saveHoldingToNacsis(mmsId: string, holding: Holding) {
  
    let fullUrl: string;
    let body = JSON.stringify(holding);

    return this.getInitData().pipe(
      mergeMap(initData => {
        fullUrl = this.setBaseUrl(initData) + mmsId;
        return this.getAuthToken()}),
      mergeMap(authToken => {
        let headers = this.setAuthHeader(authToken);
        if (this.isEmpty(holding.ID)) { // create/POST
          return this.http.post<any>(fullUrl, body, { headers });
        } else { // update/PUT 
          fullUrl = fullUrl + '/' + holding.ID;
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

  clearSessionStorage() {
    sessionStorage.clear();
  }

  getSessionStorageItem(key: string) : string {
    return sessionStorage.getItem(key);
  }  

  setSessionStorageItem(key: string, value: string) {
    sessionStorage.setItem(key, value);
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
}

export class Holding {
  ID: string = "";
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