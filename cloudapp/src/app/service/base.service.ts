
import { Injectable } from '@angular/core';
import { InitData, CloudAppEventsService } from '@exlibris/exl-cloudapp-angular-lib';
import { Observable, of } from 'rxjs';
import jwt_decode from "jwt-decode";
import {JwtPayload} from "jwt-decode";
import { HttpClient } from "@angular/common/http";


// @Injectable({
//     providedIn: 'root'
// })

export abstract class BaseService {
    protected http: HttpClient;
    protected eventsService: CloudAppEventsService;
    protected  _url: string;
    protected _initData: InitData;
    protected _authToken: string;
    protected _exp: number;
    public OkStatus: string = 'OK';

    constructor(
        eventsService: CloudAppEventsService,
        http: HttpClient
    ) { 
        this.http = http;
        this.eventsService = eventsService;
    }

    isEmpty(val) {
        return (val === undefined || val == null || val.length <= 0) ? true : false;
    }

    setBaseUrl(initData: InitData) : string {
        if(this.isEmpty(this._url)) {
          console.log(initData);
          this._initData = initData;
          this._url = this._initData.urls['alma'];
          this._url = this._url + 'view/nacsis/';
          this._url = this._url + this._initData.instCode + '/';
          console.log(this._url);
        }
        return this._url;
    }

    getInitData(): Observable<InitData> {
        if(this.isEmpty(this._initData))
            return this.eventsService.getInitData();
        return of(this._initData);
    }


    // Token-based authentication menagment

    getAuthToken(): Observable<string> {
        const now = Date.now(); // Unix timestamp in milliseconds
        if (this.isEmpty(this._exp) || now >= this._exp) {
            return this.eventsService.getAuthToken();
        }
        return of(this._authToken);
    }
    
    setAuthHeader(authToken: string) {
        if(this._authToken !== authToken) {
          console.log("JWT = " + authToken);
          this._authToken = authToken;
          let decoded = jwt_decode(this._authToken) as JwtPayload;
          console.log(decoded);
          this._exp = decoded.exp;
        }
        return { 'Authorization': `Bearer ${this._authToken}` };
    }
}


export class Header {
    status: string = ""
    errorMessage: string = ""
    BID: string = ""
    type: string = "" // BOOK/SERIAL
  }

export const ROUTING_STATE_KEY = "routingState";

export enum AppRoutingState {
    MainMenuPage = "",
    HoldingsMainPage = "/holdings",
    CatalogSearchPage = "/catalog"
}