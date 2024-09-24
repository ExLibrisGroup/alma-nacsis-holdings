import { HttpClient } from "@angular/common/http";
import { mergeMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { CloudAppEventsService, CloudAppStoreService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { ResultsHeader } from '../catalog/results-types/results-common';
import { BaseService } from "./base.service";
import { AlmaApiService } from "./alma.api.service";
import { MemberUpdate } from "../catalog/results-types/member";
import { SessionStorageKeys } from '../Utils/RoutingUtil';


@Injectable({
  providedIn: 'root'
})
export class MembersService extends BaseService {
  
  public OwnerKey: string = 'MEMBER_OWNER_KEY';
  private _header: ResultsHeader;
  protected almaApiService :AlmaApiService;

  constructor(
    protected eventsService: CloudAppEventsService,
    protected storeService: CloudAppStoreService,
    protected http: HttpClient
  ) {
    super(eventsService, storeService, http);
  }

  setBaseUrl(initData: InitData) : string {
    let baseUrl = super.setBaseUrl(initData);
    baseUrl = baseUrl + "members?";
    return baseUrl;
  }

  saveMemberToNacsis(member: MemberUpdate) {
  
    let fullUrl: string;
    let queryParams= "&dataBase=" + "MEMBER&";
    let body = JSON.stringify(member);

    return this.getInitData().pipe(
      mergeMap(initData => {
        fullUrl = this.setBaseUrl(initData)
         return this.storeService.get(SessionStorageKeys.SELECTED_INTEGRATION_PROFILE);
      }),
      mergeMap(profile => {
          let parsedProfile = JSON.parse(profile);
          fullUrl += "rsLibraryCode=" + parsedProfile.rsLibraryCode +  queryParams;
          console.log(fullUrl);
          return this.getAuthToken()
      }),
      mergeMap(authToken => {
        let headers = this.setAuthHeader(authToken);
        fullUrl = fullUrl + "ID=" + member.ID
        return this.http.put<any>(fullUrl, body, { headers });
      })
    );
  }
}

export class Member {
    COPYS: any[];
    LOANS: any[];
    FAXS: any[];
    CATTEL: any[];
    CATDEPT: any[];
    CATFAX: any[];
    SYSDEPT: any[];
    SYSTEL: any[];
    SYSFAX: any[];
    EMAIL: any[];
    POLICY:any[];
}