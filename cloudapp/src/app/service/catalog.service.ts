import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { BaseService, Header } from "./base.service";
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { SearchType } from '../catalog/main/form-utils';
import { NacsisCatalogResults, ResultsHeader } from '../catalog/results-types/results-common';
import { Monograph } from '../catalog/results-types/monographs';
import { Serial } from '../catalog/results-types/serials';
import { Name } from '../catalog/results-types/name';
import { UniformTitle } from '../catalog/results-types/uniformTitle';
import { AlmaApiService, IntegrationProfile } from './alma.api.service';

@Injectable({
    providedIn: 'root'
})
export class CatalogService extends BaseService {    

    private resultsHeader: ResultsHeader;
    private searchResultsMap: Map<SearchType, NacsisCatalogResults>;
    private integrationProfile: string;

    public queryParams: string = "";

    constructor(
        protected eventsService: CloudAppEventsService,
        protected http: HttpClient,
        protected almaApi: AlmaApiService
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

    setBaseUrl(initData: InitData) : string {
        let baseUrl = super.setBaseUrl(initData);
        baseUrl = baseUrl + "copyCatalog?";
        return baseUrl;
    }

    getSearchResultsFromNacsis(queryParams: string, searchType:SearchType){

        let fullUrl: string;
        this.queryParams = queryParams;
        
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
                if (response.status === this.OkStatus && !this.isEmpty(response.records)) {
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

    importRecordToAlma(searchType: SearchType, rawData: string) {
        return this.almaApi.getIntegrationProfile().pipe(                
            mergeMap(integrationProfile => {
                let integrationProfileID = this.integrationProfileFactory(searchType, integrationProfile);
                let body = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><bib><record_format>catp</record_format><record>" + rawData + "</record></bib>";
                return this.http.post<any>("/almaws/v1/bibs?import_profile="+integrationProfileID, body)
            }),
            mergeMap(response => {
                return of(response);
                // return of(response.warnings, response.mms_id);                    
            })
        ); 
    }

    integrationProfileFactory(searchType: SearchType, integrationProfile: IntegrationProfile) {
        switch(searchType) {
            case (SearchType.Monographs || SearchType.Serials):
                return integrationProfile.repositoryImportProfile;
            case (SearchType.Names):
                return integrationProfile.authorityImportProfileNames;
            case (SearchType.UniformTitles):
                return integrationProfile.authorityImportProfileUniformTitles;
        }
    }

}


