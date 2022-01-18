import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { BaseService } from "./base.service";
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';


import { SearchType } from '../user-controls/search-form/search-form-utils';
import { AlmaApiService, IntegrationProfile } from './alma.api.service';

@Injectable({
    providedIn: 'root'
})
export class CatalogService extends BaseService {
    constructor(
        protected eventsService: CloudAppEventsService,
        protected http: HttpClient,
        protected almaApi: AlmaApiService,
        protected translate: TranslateService
    ) {
        super(eventsService, http);
    }

    setBaseUrl(initData: InitData): string {
        let baseUrl = super.setBaseUrl(initData);
        baseUrl = baseUrl + "copyCatalog?";
        return baseUrl;
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
        switch (searchType) {
            case (SearchType.Monographs):
                return { typeTag: "bib", urlType: "", ID: integrationProfile.repositoryImportProfile };
            case (SearchType.Serials):
                return { typeTag: "bib", urlType: "", ID: integrationProfile.repositoryImportProfile };
            case (SearchType.Names):
                return { typeTag: "authority", urlType: "/authorities", ID: integrationProfile.authorityImportProfileNames };
            case (SearchType.UniformTitles):
                return { typeTag: "authority", urlType: "/authorities", ID: integrationProfile.authorityImportProfileUniformTitles };
        }
    }
}