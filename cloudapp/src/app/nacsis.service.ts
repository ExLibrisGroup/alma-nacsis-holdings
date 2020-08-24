import { HttpClient, HttpHeaders } from "@angular/common/http";
import { delay, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { CloudAppConfigService, CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';


@Injectable({
  providedIn: 'root'
})
export class NacsisService {
  private _holdings: Holding[];
  private _header: Header;
  private _config;
  private url: string;
  private lang: string;
  public OkStatus: string = 'OK';

  constructor(
    private http: HttpClient,
    private configService: CloudAppConfigService,
    private eventsService: CloudAppEventsService

  ) {
    this.configService.get().subscribe(resp => this._config = resp);
    
    this.getUrl().subscribe({
      next: (data) => {
        console.log(data);
        this.lang = data.lang;
        this.url = data.urls['alma'];
        this.url = this.url + 'view/nacsis/';
        this.url = this.url + data.instCode + '/';
        console.log(this.url);
      }
    })
  }

  isEmpty(val) {
    return (val === undefined || val == null || val.length <= 0) ? true : false;
  }

  getUrl() : Observable<InitData>{
    return this.eventsService.getInitData();
  }
  getHeader(): Header {
    return this._header;
  }

  async getHoldingResponse(mmsId: any, owner: String): Promise<Header> {

    //var getUrl = "http://il-shayh-7290.corp.exlibrisgroup.com:1801/view/nacsis/TRAINING_1_INST/9927041500521";
    var getUrl = this.url + mmsId;

    // add query params
    getUrl = getUrl + "?owner=" + owner;

    await this.http.get<any>(getUrl)
      .toPromise()
      .then(
        response => {
          console.log(response);
          this._header = response;
          this._holdings = response.nacsisRecordList;

          if (this._header.status === this.OkStatus && !this.isEmpty(this._holdings)) {
            this.updateHoldingPreview();
          }
        }
      ).catch(e => {
        console.log(e);
      });
    return new Promise(resolve => {
      resolve(this._header);
    });
  }

  getHolding(id: string): Observable<Holding> {
    return of(this._holdings)
      .pipe(
        map(holdings => holdings.find(holding => holding.ID === id))
      )
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
    });
  }

  deleteHoldingFromNacsis(mmsId: string, holdingsId: string) {
    //var deleteUrl = "http://il-shayh-7290.corp.exlibrisgroup.com:1801/view/nacsis/TRAINING_1_INST/9927041500521" + '/' + holdingsId;;
    var deleteUrl = this.url + mmsId + '/' + holdingsId;

    return this.http.delete<any>(deleteUrl);
  }

  deleteHolding(holdingId: string) {
    const index = this._holdings.findIndex(holding => holding.ID === holdingId);
    if (index > -1) {
      this._holdings.splice(index, 1);
      this.updateHoldingPreview();
    }
  }

  saveHoldingToNacsis(mmsId: string, holding: Holding) {

    //var saveUrl = "http://il-shayh-7290.corp.exlibrisgroup.com:1801/view/nacsis/TRAINING_1_INST/9927041500521";
    var saveUrl = this.url + mmsId;

    var body = JSON.stringify(holding);

    if (this.isEmpty(holding.ID)) { // create/POST
      return this.http.post<any>(saveUrl, body);
    }

    saveUrl = saveUrl + '/' + holding.ID;
    return this.http.put<any>(saveUrl, body); // update/PUT
  }

  saveHolding(holding: Holding) {
    if(!this._holdings) {
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

  set config(config: any) {
    this._config = config;
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