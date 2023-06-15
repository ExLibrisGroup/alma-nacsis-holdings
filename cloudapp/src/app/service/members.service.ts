import { HttpClient } from "@angular/common/http";
import { mergeMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { ResultsHeader } from '../catalog/results-types/results-common';
import { BaseService } from "./base.service";
import { AlmaApiService } from "./alma.api.service";
import { MemberUpdate } from "../catalog/results-types/member";

@Injectable({
  providedIn: 'root'
})
export class MembersService extends BaseService {
  
  public OwnerKey: string = 'MEMBER_OWNER_KEY';
  private _header: ResultsHeader;
  protected almaApiService :AlmaApiService;

  constructor(
    protected eventsService: CloudAppEventsService,
    protected http: HttpClient
  ) {
    super(eventsService, http);
  }

  setBaseUrl(initData: InitData) : string {
    let baseUrl = super.setBaseUrl(initData);
    baseUrl = baseUrl + "members?";
    return baseUrl;
  }

  saveMemberToNacsis(member: MemberUpdate) {
  
    let fullUrl: string;
    let body = JSON.stringify(member);

    return this.getInitData().pipe(
      mergeMap(initData => {
        fullUrl = this.setBaseUrl(initData) + "dataBase=" + "MEMBER&";
        return this.getAuthToken()}),
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