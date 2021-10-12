import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { BaseService, Header } from "./base.service";
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';


import { SearchType } from '../user-controls/search-form/search-form-utils';
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

    private searchResultsMap: Map<SearchType, NacsisCatalogResults>;
    public currentSearchType: SearchType;

    constructor(
        protected eventsService: CloudAppEventsService,
        protected http: HttpClient,
        protected almaApi: AlmaApiService,
        protected translate: TranslateService
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

    setSearchResultsMap(searchType: SearchType, response: any, urlParams: string) {
        this.searchResultsMap.get(searchType).setHeader(response);
        this.searchResultsMap.get(searchType).setQueryParams(urlParams);
        this.searchResultsMap.get(searchType).setResults(new Array());
        response.records.forEach(record => {
            this.searchResultsMap.get(searchType).getResults().push(this.resultsTypeFactory(searchType, record));
        });   
    }    

    clearAllSearchResults(){
        this.initResultsMap();
    }

    setCurrentSearchType(searchType: SearchType) {
        this.currentSearchType = searchType;
    }
    
    getQueryParams(searchType?: SearchType) {
        if(searchType !== undefined) {
            return this.searchResultsMap.get(searchType).getQueryParams();
        } else {
            return this.searchResultsMap.get(this.currentSearchType).getQueryParams();
        }
    }

    setBaseUrl(initData: InitData) : string {
        let baseUrl = super.setBaseUrl(initData);
        baseUrl = baseUrl + "copyCatalog?";
        return baseUrl;
    }

    getSearchResultsFromNacsis(queryParams: string){

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

    
    resultsTypeFactory(type: SearchType, record: any){
        switch (type){
            case SearchType.Monographs:
                return new Monograph(record, this.translate);
            case SearchType.Serials:
                return new Serial(record, this.translate);
            case SearchType.Names:
                    return new Name(record, this.translate);
            case SearchType.UniformTitles:
                return new UniformTitle(record, this.translate);
            default:
                return null;

        }
    }

    importRecordToAlma(searchType: SearchType, rawData: string) {
        return this.almaApi.getIntegrationProfile().pipe(                
            mergeMap(integrationProfile => {
                let factoryValues = this.integrationProfileFactory(searchType, integrationProfile);
                let body = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><" + factoryValues.typeTag + "><record_format>catp</record_format><record><![CDATA[" + rawData + "]]></record></" + factoryValues.typeTag + ">";
                return this.http.post<any>("/almaws/v1/bibs" + factoryValues.urlType + "?import_profile=" + factoryValues.ID, body)
            }),
            mergeMap(response => {
                return of(response);
                // return of(response.warnings, response.mms_id);                    
            })
        ); 
    }

    integrationProfileFactory(searchType: SearchType, integrationProfile: IntegrationProfile) {
        switch(searchType) {
            case (SearchType.Monographs):
                return { typeTag: "bib", urlType: "", ID: integrationProfile.repositoryImportProfile };
            case (SearchType.Serials):
                return { typeTag: "bib", urlType: "", ID: integrationProfile.repositoryImportProfile };
            case (SearchType.Names):
                return { typeTag: "authority", urlType: "/authorities", ID: integrationProfile.authorityImportProfileNames };
            case (SearchType.UniformTitles):
                return { typeTag: "authority", urlType: "/authorities", ID: integrationProfile.authorityImportProfileUniformTitles};
        }
    }

}


/* 
*** BIB ***
url - /almaws/v1/bibs?
tags - <bib>
*** AUTH ***
url - almaws/v1/bibs/authorities?
tags - <authority>
*/