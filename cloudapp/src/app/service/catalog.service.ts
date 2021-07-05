import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { BaseService } from "./base.service";


@Injectable({
    providedIn: 'root'
})
export class CatalogService extends BaseService {

    constructor(
        protected eventsService: CloudAppEventsService,
        protected http: HttpClient
      ) {
        super(eventsService, http);
    }

    setBaseUrl(initData: InitData) : string {
        let baseUrl = super.setBaseUrl(initData);
        baseUrl = baseUrl + "copyCatalog";
        return baseUrl;
    }


    





}