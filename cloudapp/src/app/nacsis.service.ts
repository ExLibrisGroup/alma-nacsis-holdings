import { HttpClient, HttpHeaders } from "@angular/common/http";
import { delay, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { CloudAppConfigService } from '@exlibris/exl-cloudapp-angular-lib';

@Injectable({
  providedIn: 'root'
})
export class NacsisService {
  private _holdings: Holding[];
  private _header: Header;
  private _config;

  constructor(
    private http: HttpClient,
    private configService: CloudAppConfigService
  ) {
    this.configService.get().subscribe(resp => this._config = resp);
  }

  isEmpty(val) {
    return (val === undefined || val == null || val.length <= 0) ? true : false;
  }

  getHeader(): Header {
    return this._header;
  }

  async getHoldings(mmsId: any): Promise<Holding[]> { //Observable<Holding[]> {

    // extract NACSIS number from bib
    //const nacsisId = bib.network_number.find( v => v.match(/^\(NACSIS\)\s*(\d+)\s*/))

    var url = "http://il-shayh-7290.corp.exlibrisgroup.com:1801/view/nacsis/TRAINING_1_INST/9927041500521";

    await this.http.get<any>(url)
      .toPromise()
      .then(
        response => {
          console.log(response);
          this._header = response;
          this._holdings = response.nacsisRecordList;
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
          });
        }
      );
    return new Promise(resolve => {
      resolve(this._holdings);
    });
  }

  getHolding(id: string): Observable<Holding> {
    return of(this._holdings)
      .pipe(
        map(holdings => holdings.find(holding => holding.ID === id))
      )
  }

  deleteHolding(id: string) {
    // remove from holdings list? maybe after the response arrived?
    this._holdings.splice(this._holdings.findIndex(item => item.ID === id), 1);

    var url = "http://il-shayh-7290.corp.exlibrisgroup.com:1801/view/nacsis/TRAINING_1_INST/9927041500521";
    url = url + '/' + id;

    return this.http.delete<any>(url);
  }

  saveHolding(holding: Holding) {

    // const index = this._holdings.findIndex(obj => obj.ID === holding.ID);
    // if (index >= 0)
    //   this._holdings[index] = holding;
    // else
    //   this._holdings.push(holding);

    // TODO: url
    var url = "http://il-shayh-7290.corp.exlibrisgroup.com:1801/view/nacsis/TRAINING_1_INST/9927041500521";
    var body = JSON.stringify(holding);

    if (this.isEmpty(holding.ID)) { // create/POST
      return this.http.post<any>(url, body);
    }
    url = url + '/' + holding.ID;
    return this.http.put<any>(url, body); // update/PUT
  }

  set config(config: any) {
    this._config = config;
  }
}

export class Header {
  status: string = ""
  errorMessage: string = ""
  BID: string = ""
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