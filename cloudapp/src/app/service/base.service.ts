import { Injectable } from '@angular/core';
import { InitData, CloudAppEventsService } from '@exlibris/exl-cloudapp-angular-lib';
import { Observable, of } from 'rxjs';
import jwt_decode from "jwt-decode";
import {JwtPayload} from "jwt-decode";
import { HttpClient } from "@angular/common/http";
import { SearchType } from '../user-controls/search-form/search-form-utils';
import { NacsisCatalogResults, ResultsHeader } from '../catalog/results-types/results-common';
import { TranslateService } from '@ngx-translate/core';
import { Monograph } from '../catalog/results-types/monographs';
import { Serial } from '../catalog/results-types/serials';
import { Name } from '../catalog/results-types/name';
import { UniformTitle } from '../catalog/results-types/uniformTitle';
import { Member } from '../catalog/results-types/member';
import { mergeMap } from 'rxjs/operators';

export abstract class BaseService {
    private searchResultsMap: Map<SearchType, NacsisCatalogResults>;
    protected translate: TranslateService
    protected http: HttpClient;
    protected eventsService: CloudAppEventsService;
    protected  _url: string;
    protected _initData: InitData;
    protected _authToken: string;
    protected _exp: number;
    public currentSearchType: SearchType;
    public OkStatus: string = 'OK';
    public OwnerKey: string = 'OWNER_KEY';

    constructor(
        eventsService: CloudAppEventsService,
        http: HttpClient
    ) { 
        this.http = http;
        this.eventsService = eventsService;
        this.initResultsMap()
    }

    isEmpty(val : any) {
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

    setSearchResultsMap(searchType: SearchType, response: any, urlParams: string) {
        this.searchResultsMap.get(searchType).setHeader(response);
        this.searchResultsMap.get(searchType).setQueryParams(urlParams);
        this.searchResultsMap.get(searchType).setResults(new Array());
        response.records.forEach(record => {
            this.searchResultsMap.get(searchType).getResults().push(this.resultsTypeFactory(searchType, record));
        });
    }

    resultsTypeFactory(type: SearchType, record: any) {
        switch (type) {
            case SearchType.Monographs:
                return new Monograph(record, this.translate);
            case SearchType.Serials:
                return new Serial(record, this.translate);
            case SearchType.Names:
                return new Name(record, this.translate);
            case SearchType.UniformTitles:
                return new UniformTitle(record, this.translate);
            case SearchType.Members:
                return new Member(record, this.translate);
            default:
                return null;

        }
    }

    private initResultsMap() {
        this.searchResultsMap = new Map([
            [SearchType.Monographs, new NacsisCatalogResults()],
            [SearchType.Serials, new NacsisCatalogResults()],
            [SearchType.Names, new NacsisCatalogResults()],
            [SearchType.UniformTitles, new NacsisCatalogResults()],
            [SearchType.Members, new NacsisCatalogResults()]
        ]);
    }

    getSearchResults(type: SearchType) {
        return this.searchResultsMap.get(type);
    }

    clearAllSearchResults() {
        this.initResultsMap();
    }

    getQueryParams(searchType?: SearchType) {
        if (searchType !== undefined) {
            return this.searchResultsMap.get(searchType).getQueryParams();
        } else {
            return this.searchResultsMap.get(this.currentSearchType).getQueryParams();
        }
    }

    setCurrentSearchType(searchType: SearchType) {
        this.currentSearchType = searchType;
    }

    setSearchMemberDBResultsMap(searchType: SearchType, memberinfo: any) {
        this.searchResultsMap.get(searchType).setResults(new Array());
        memberinfo.forEach(record => {
            this.searchResultsMap.get(searchType).getResults().push(this.resultsTypeFactory(searchType, record));
       
        });
    }

    getSearchResultsFromNacsis(queryParams: string) {

        let fullUrl: string;

        return this.getInitData().pipe(
            mergeMap(initData => {
                fullUrl = this.setBaseUrl(initData) + queryParams;
                return this.getAuthToken()
            }),
            mergeMap(authToken => {
                let headers = this.setAuthHeader(authToken);
                return this.http.get<any>(fullUrl, { headers })
            }),
            mergeMap(response => {
                return of(response);
            })
        );
    }
}

// Session Storage consts 
// TODO: Turned it into Enum
export const ROUTING_STATE_KEY = "routingState";
export const LIBRARY_ID_KEY = "libraryIDKey";
export const LIBRARY_MEMBERINFO_KEY = "libraryMemberInfoKey";
export const SELECTED_RECORD_ILL = "selectedDataInILL";
export const SELECTED_RECORD_LIST_ILL = "selectedDataListInILL";
export const RESULT_RECORD_LIST_ILL = "resultDataInILL";
export const REQUEST_EXTERNAL_ID = "requestExternalId";
export const MEMBER_RECORD = "memberRecord";
export const FANO_ID = "fanoId";
export const VOLUME_LIST = "volumeList";



export enum AppRoutingState {
    MainMenuPage = "",
    HoldingsMainPage = "/holdings",
    CatalogSearchPage = "/catalog",
    ILLBorrowingMainPage = "/ILL",
    SearchRecordMainPage = "/searchRecord",
    HoldingSearchMainPage = "/holdingSearch",
    MembersMainPage = "/members"
}

export enum QueryParams {
    PageIndex = "pageIndex",
    PageSize = "pageSize",
    SearchType = "searchType",
    Databases = "dataBase",
    ID = "ID"
  }
  