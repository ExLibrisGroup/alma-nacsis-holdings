import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { BaseService, Header } from "./base.service";
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { SearchType } from '../catalog/search-form/form-utils';
import { NacsisCatalogResults, ResultsHeader } from '../catalog/results-types/results-common';
import { Monograph } from '../catalog/results-types/monographs';
import { Serial } from '../catalog/results-types/serials';
import { Name } from '../catalog/results-types/name';
import { UniformTitle } from '../catalog/results-types/uniformTitle';


import  *  as  monographsDataFile  from  'C:/Users/dork/Documents/URMs/Nacsis/copy catalog frontend/monography.json'
import  *  as  namesDataFile  from  'C:/Users/dork/Documents/URMs/Nacsis/copy catalog frontend/name.json';
import  *  as  serialsDataFile  from  'C:/Users/dork/Documents/URMs/Nacsis/copy catalog frontend/serial.json';
import  *  as  uniformTitlesDataFile  from  'C:/Users/dork/Documents/URMs/Nacsis/copy catalog frontend/uniformTitle.json';



@Injectable({
    providedIn: 'root'
})
export class CatalogService extends BaseService {    

    private resultsHeader: ResultsHeader;
    private searchResultsMap: Map<SearchType, NacsisCatalogResults>;

    public queryParams: string = "";
    // public queryParams: string = "fromIndex=1&toIndex=20&searchType=Monographs&database=BOOK,PREBOOK,JPMARC&ID=12345";

    constructor(
        protected eventsService: CloudAppEventsService,
        protected http: HttpClient
      ) {
        super(eventsService, http);
        this.initResultsMap();
    }

    private initResultsMap(){
        this.searchResultsMap = new Map([
            [SearchType.Monographs, new NacsisCatalogResults()],
            [SearchType.Serials, new NacsisCatalogResults()],
            [SearchType.Names, new NacsisCatalogResults()],
            [SearchType.UniformTitles, new NacsisCatalogResults()]
        ]);
    }

    getSearchResults(type: SearchType) {
        return this.searchResultsMap.get(type);
    }

    clearAllSearchResults(){
        this.initResultsMap();
    }
    
    getQueryParams() {
        return this.queryParams;
    }

    // setQueryParams(queryParams: string) {
    //     this.queryParams = queryParams;
    // }

    setBaseUrl(initData: InitData) : string {
        let baseUrl = super.setBaseUrl(initData);
        baseUrl = baseUrl + "copyCatalog?";
        return baseUrl;
    }

    getSearchResultsFromNacsis(queryParams: string, searchType:SearchType){

        let fullUrl: string;
        this.queryParams = this.addPaginationParams() + queryParams;
        
        return this.getInitData().pipe(
            mergeMap(initData => {
                fullUrl = this.setBaseUrl(initData) + this.queryParams;
                return this.getAuthToken()
             }),
             mergeMap(authToken => {
                let headers = this.setAuthHeader(authToken);
                return this.http.get<any>(fullUrl, { headers })
            }),
            mergeMap(response => {
                // this.setResultsDataFromResponse(searchType);
                if (response.status === this.OkStatus) {
                    this.searchResultsMap.get(searchType).setHeader(response);
                    this.searchResultsMap.get(searchType).setResults(new Array());
                    response.records.forEach(record => {
                        this.searchResultsMap.get(searchType).getResults().push(this.resultsTypeFactory(searchType, record));
                    });   
                }
                return of(response);
            })
        );
    }

    
    resultsTypeFactory(type: SearchType, record: any){
        switch (type){
            case SearchType.Monographs:
                return new Monograph(record);
            case SearchType.Serials:
                return new Serial(record);
            case SearchType.Names:
                    return new Name(record);
            case SearchType.UniformTitles:
                return new UniformTitle(record);
            default:
                return null;

        }
    }

    addPaginationParams(): string {
        let fromIndex = 1;
        let toIndex = 20;
        return "fromIndex=" + fromIndex + "&toIndex=" + toIndex + "&";
    }
    
    setResultsDataFromResponse(searchType: SearchType){
        let jsonFile: any;
        if(searchType == SearchType.Monographs)
            jsonFile = (monographsDataFile  as  any).default;
        else if(searchType == SearchType.Serials)
            jsonFile = (serialsDataFile  as  any).default;
        else if(searchType == SearchType.Names)
            jsonFile = (namesDataFile  as  any).default;
        else if(searchType == SearchType.UniformTitles)
            jsonFile = (uniformTitlesDataFile  as  any).default;
           
        let type = jsonFile.searchType;
        this.searchResultsMap.get(type).setHeader(jsonFile);
        this.searchResultsMap.get(type).setResults(new Array());
        jsonFile.records.forEach(record => {
            this.searchResultsMap.get(type).getResults().push(this.resultsTypeFactory(type, record));
        });   
    }

}


