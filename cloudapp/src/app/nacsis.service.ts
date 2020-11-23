import { HttpClient } from "@angular/common/http";
import { map, switchMap, mergeMap } from 'rxjs/operators';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { CloudAppConfigService, CloudAppEventsService } from '@exlibris/exl-cloudapp-angular-lib';


@Injectable({
  providedIn: 'root'
})
export class NacsisService {
  private _holdings: Holding[];
  private _header: Header;
  private _config;
  private _url: string;
  private _authToken: string;
  private _exp: number;
  public OkStatus: string = 'OK';

  public _headerSubject = new BehaviorSubject<Header>(null);

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

  getHeader(): Header {
    return this._header;
  }

  async getUrl(): Promise<string> {

    if (this._url) {
      return this._url;
    }

    await this.eventsService.getInitData().
      toPromise().then(data => {
        console.log(data);
        this._url = data.urls['alma'];
        this._url = this._url + 'view/nacsis/';
        this._url = this._url + data.instCode + '/';
        console.log(this._url);
      }, error => {
        console.log(error);
        throw error;
      }/*).catch(e => {
        console.log(e);
        throw new Error('getInitData() Failed');
      }*/);

    return this._url;
  }

  async getAuthHeader(): Promise<any> {
    const now = Date.now(); // Unix timestamp in milliseconds

    if (this.isEmpty(this._exp) || now >= this._exp) {
      console.log("App loading JWT...");
      await this.eventsService.getAuthToken()
        .toPromise().then(
          jwt => {
            console.log("JWT = " + jwt);
            this._authToken = jwt;

            var fields = jwt.split('.');
            let field1 = atob(fields[1]);
            console.log('authToken JWT decoded:', field1);

            // extract exp
            let jsonObject = JSON.parse(field1);
            this._exp = Number(jsonObject.exp);
          }, error => {
            console.log(error);
            throw error;
          }
        )/*.catch(e => {
          console.log(e);
          throw new Error('getAuthToken() Failed');
        });*/
    }
    return { 'Authorization': `Bearer ${this._authToken}` };
  }

  async getHoldingsFromNacsis(mmsId: any, owner: String): Promise<Header> {

    let url = await this.getUrl() + mmsId;

    // add query params
    url = url + "?owner=" + owner;

    // add jwt header
    const headers = await this.getAuthHeader();

    await this.http.get<any>(url, { headers })//.pipe(timeout(60*1000))
      .toPromise().then(
        response => {
          console.log(response);
          this._header = response;
          this._holdings = response.nacsisRecordList;

          if (this._header.status === this.OkStatus && !this.isEmpty(this._holdings)) {
            this.updateHoldingPreview();
          }
        }, error => {
          console.log(error);
          throw error;
        }
      )/*.catch(e => {
        console.log(e);
        throw new Error('getHoldingsFromNacsis() Failed');
      });*/
    return this._header;
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

  setUrl(): Observable<string> {

    if (this.isEmpty(this._url)) {
      this.eventsService.getInitData()
        .subscribe(data => {
          console.log(data);
          this._url = data.urls['alma'];
          this._url = this._url + 'view/nacsis/';
          this._url = this._url + data.instCode + '/';
          console.log(this._url);
        });
    }
    return of(this._url);
  }

  setAuthHeader(): Observable<any> {

    const now = Date.now(); // Unix timestamp in milliseconds

    if (this.isEmpty(this._exp) || now >= this._exp) {
      console.log("App loading JWT...");
      this.eventsService.getAuthToken()
        .subscribe(jwt => {
          console.log("JWT = " + jwt);
          this._authToken = jwt;

          var fields = jwt.split('.');
          let field1 = atob(fields[1]);
          console.log('authToken JWT decoded:', field1);

          // extract exp
          let jsonObject = JSON.parse(field1);
          this._exp = Number(jsonObject.exp);
        }
        );
    }
    return of({ 'Authorization': `Bearer ${this._authToken}` });
  }

  deleteHoldingFromNacsis(mmsId: string, holdingsId: string) {
    
    let fullUrl: string;
    
    return this.setUrl().pipe(
      mergeMap(baseUrl => {
        fullUrl = baseUrl + mmsId + '/' + holdingsId;
        return this.setAuthHeader()}),
      mergeMap(headers => {
        return this.http.delete<any>(fullUrl, { headers });
      })
    );
  }

  async deleteHoldingFromNacsisUsingPromise(mmsId: string, holdingsId: string): Promise<Header> {

    let url = await this.getUrl() + mmsId + '/' + holdingsId;

    // add jwt header
    const headers = await this.getAuthHeader();

    let header: Header;

    await this.http.delete<any>(url, { headers }).
      toPromise().then(response => { header = response });

    return header;
  }

  deleteHolding(holdingId: string) {
    const index = this._holdings.findIndex(holding => holding.ID === holdingId);
    if (index > -1) {
      this._holdings.splice(index, 1);
      this.updateHoldingPreview();
    }
  }

  async saveHoldingToNacsis(mmsId: string, holding: Holding): Promise<Header> {
    
    let url = await this.getUrl() + mmsId;

    let body = JSON.stringify(holding);

    // add jwt header
    const headers = await this.getAuthHeader();

    let header: Header;

    if (this.isEmpty(holding.ID)) { // create/POST
      await this.http.post<any>(url, body, { headers }).
        toPromise().then(response => { header = response; });
    } else { // update/PUT 
      url = url + '/' + holding.ID;
      await this.http.put<any>(url, body, { headers }).
        toPromise().then(response => { header = response; });
    }
    return header;
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