import { HttpClient } from "@angular/common/http";
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';
import { CloudAppEventsService, CloudAppStoreService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { BaseService, SELECTED_INTEGRATION_PROFILE } from "./base.service";
import { Holding, HeaderHolding } from '../Utils/HoldingsUtil';


@Injectable({
  providedIn: 'root'
})
export class HoldingsService extends BaseService {
  private _holdings: Holding[];
  private _header: HeaderHolding;
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

  getHeader(): HeaderHolding {
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