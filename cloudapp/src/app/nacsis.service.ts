import { HttpClient, HttpHeaders } from "@angular/common/http";
import { delay, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { CloudAppConfigService, CloudAppEventsService } from '@exlibris/exl-cloudapp-angular-lib';


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
  }

  isEmpty(val) {
    return (val === undefined || val == null || val.length <= 0) ? true : false;
  }

  async getUrl(): Promise<string> {

    if (this.url) {
      return this.url;
    }

    await this.eventsService.getInitData().
      toPromise().
      then(data => {
        console.log(data);
        this.lang = data.lang;
        this.url = data.urls['alma'];
        this.url = this.url + 'view/nacsis/';
        this.url = this.url + data.instCode + '/';
        console.log(this.url);
      });
    return this.url;
  }

  getLang() {
    return '?lang=' + this.lang;
  }

  getHeader(): Header {
    return this._header;
  }

  async getHoldingResponse(mmsId: any): Promise<Header> {

    var getUrl = await this.getUrl()  + mmsId;// + this.getLang();
    //var getUrl = "http://il-shayh-7290.corp.exlibrisgroup.com:1801/view/nacsis/TRAINING_1_INST/9927041500521" + "?lang=jp";

    await this.http.get<any>(getUrl)
      .toPromise()
      .then(
        response => {
          console.log(response);
          this._header = response;
          this._holdings = response.nacsisRecordList;

          if (this._header.status === this.OkStatus && !this.isEmpty(this._holdings)) {

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

  deleteHolding(mmsId: string, holdingsId: string) {
    // TODO: delete from this._holdings? currently get called after delete
    //  and therefore init this._holdings
    // delete after success response?
    // this._holdings.splice(this._holdings.findIndex(item => item.ID === holdingsId), 1);

    var deleteUrl = this.url + mmsId + '/' + holdingsId;// + this.getLang();

    //var deleteUrl = "http://il-shayh-7290.corp.exlibrisgroup.com:1801/view/nacsis/TRAINING_1_INST/9927041500521";
    //deleteUrl = deleteUrl + '/' + holdingsId;

    return this.http.delete<any>(deleteUrl);
  }

  saveHolding(mmsId: string, holding: Holding) {

    // findIndex return last index in list although holding.ID is empty
    // const index = this._holdings.findIndex(obj => obj.ID === holding.ID);
    // if (index >= 0)
    //   this._holdings[index] = holding;
    // else
    //   this._holdings.push(holding);

    var saveUrl = this.url + mmsId;

    //var saveUrl = "http://il-shayh-7290.corp.exlibrisgroup.com:1801/view/nacsis/TRAINING_1_INST/9927041500521";

    var body = JSON.stringify(holding);

    if (this.isEmpty(holding.ID)) { // create/POST
      //saveUrl = saveUrl + this.getLang();
      return this.http.post<any>(saveUrl, body);
    }
    saveUrl = saveUrl + '/' + holding.ID;// + this.getLang();

    return this.http.put<any>(saveUrl, body); // update/PUT
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