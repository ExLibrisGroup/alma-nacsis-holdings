import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { CloudAppEventsService, InitData, CloudAppRestService, HttpMethod, CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';
import { BaseService, SELECTED_INTEGRATION_PROFILE } from "./base.service";
import { mergeMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { SearchType } from '../user-controls/search-form/search-form-utils';
import { AlmaApiService, IntegrationProfile } from './alma.api.service';
import { Serial } from '../catalog/results-types/serials';
import { Monograph } from '../catalog/results-types/monographs';
import { Name } from '../catalog/results-types/name';
import { UniformTitle } from '../catalog/results-types/uniformTitle';

@Injectable({
    providedIn: 'root'
})
export class CatalogService extends BaseService {
    constructor(
        protected eventsService: CloudAppEventsService,
        protected http: HttpClient,
        protected almaApi: AlmaApiService,
        private restService: CloudAppRestService,
        protected translate: TranslateService,
        protected storeService: CloudAppStoreService
    ) {
        super(eventsService, storeService, http);
    }

    setBaseUrl(initData: InitData): string {
        let baseUrl = super.setBaseUrl(initData);
        baseUrl = baseUrl + "copyCatalog?";
        return baseUrl;
    }

    getSearchResultsFromNacsis(queryParams: string){

        let fullUrl: string;

        return this.getInitData().pipe(
            mergeMap(initData => {
                fullUrl = this.setBaseUrl(initData);
                return this.storeService.get(SELECTED_INTEGRATION_PROFILE);
            }),
            mergeMap(profile => {
                let parsedProfile = JSON.parse(profile);
                fullUrl += "rsLibraryCode=" + parsedProfile.rsLibraryCode + "&" +  queryParams;
                return this.getAuthToken()
             }),
             mergeMap(authToken => {
                let headers = this.setAuthHeader(authToken);
                return this.http.get<any>(fullUrl, { headers })
            })
        );

        
        return this.getInitData().pipe(
            mergeMap(initData => {
                fullUrl = this.setBaseUrl(initData) + queryParams;
                return this.getAuthToken()
             }),
             mergeMap(authToken => {
                let headers = this.setAuthHeader(authToken);
                return this.http.get<any>(fullUrl, { headers })
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




        // return this.almaApi.getIntegrationProfile()
        return this.storeService.get(SELECTED_INTEGRATION_PROFILE)
        .pipe(
            mergeMap(integrationProfile => {
                //let factoryValues = this.integrationProfileFactory(searchType, integrationProfile);
                const profile = JSON.parse(integrationProfile)
                let factoryValues = this.integrationProfileFactory(searchType, profile);

                let body = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><" + factoryValues.typeTag + "><record_format>catp</record_format><record><![CDATA[" + rawData + "]]></record></" + factoryValues.typeTag + ">";
                let Request = {
                    url: "/almaws/v1/bibs" + factoryValues.urlType + "?import_profile=" + factoryValues.ID,
                    method: HttpMethod.POST,
                    requestBody: body
                  };
                return this.restService.call(Request);
            })
            );
        }

    integrationProfileFactory(searchType: SearchType, integrationProfile: IntegrationProfile) {
        switch (searchType) {
            case (SearchType.Monographs):
            case (SearchType.Serials):
                if(this.isEmpty(integrationProfile.repositoryImportProfile)){
                    throw new Error("The Repository Import Profile is not configured correctly");
                }
                return { typeTag: "bib", urlType: "", ID: integrationProfile.repositoryImportProfile };
            case (SearchType.Names):
                if(this.isEmpty(integrationProfile.authorityImportProfileNames)){
                    throw new Error("The Authority Import Profile Names is not configured correctly");
                }
                return { typeTag: "authority", urlType: "/authorities", ID: integrationProfile.authorityImportProfileNames };
            case (SearchType.UniformTitles):
                if(this.isEmpty(integrationProfile.authorityImportProfileUniformTitles)){
                    throw new Error("The Authority Import Profile Uniform Titles is not configured correctly");
                }
                return { typeTag: "authority", urlType: "/authorities", ID: integrationProfile.authorityImportProfileUniformTitles};
        }
    }
}