import { HttpClient } from "@angular/common/http";
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { ResultsHeader } from '../catalog/results-types/results-common';
import { BaseService } from "./base.service";

@Injectable({
  providedIn: 'root'
})
export class MembersService extends BaseService {
  
  public OwnerKey: string = 'OWNER_KEY';
  private _header: ResultsHeader;

  constructor(
    protected eventsService: CloudAppEventsService,
    protected http: HttpClient
  ) {
    super(eventsService, http);
  }

  getMembersFromNacsis(queryParams: String){

    let fullUrl: string;
    return this.getInitData().pipe(
      mergeMap(initData => {
        fullUrl = this.setMemberBaseUrl(initData) +  queryParams;
        return this.getAuthToken()}),
      mergeMap(authToken => {
        let headers = this.setAuthHeader(authToken);
        return this.http.get<any>(fullUrl, { headers })}),
      mergeMap(response => {
        this._header = response;
        return of(this._header);
      })
    );
  }

  setMemberBaseUrl(initData: InitData) : string {
    let baseUrl = super.setBaseUrl(initData);
    baseUrl = baseUrl + "member?";
    return baseUrl;
  }
}

export class NacsisMembersRecord{
  BID: string = "";
  COPYS: string = "";
  CRTDT: string = "";
  FANO: string = "";
  FAXS: string = "";
  GRPCODE: string = "";
  ID: string = "";
  ILLFLG: string = "";
  KENCODE: string = "";
  LIBABL: string = "";
  LOANS:string = "";
  LOC: string = "";
  SUM:string="";
  ORGCODE: string = "";
  RNWDT: string = "";
  SETCODE: string = "";
  STAT:string = "";
  editable: boolean = false;
  info: string = "";
  libraryFullName: string = "";
  nacsisHoldingsList: any[];
  type: string = "";
}

export class DisplaMembersResult{
  index: number;
  name: string = "";
  vol: any[];//book only
  hlv: string = "";//serial only
  hlyr: string = "";//serial only
  cln: string = "";//serial only
  ldf: string = "";//serial only
  region: string = "";
  establisher: string = "";
  institutionType: string = "";
  fee: string = "";
  location : string = "";
  photoCopy_fee : string = "";
  ill : string = "";
  stat : string = "";
  photoCopy  : string = "";
  loan : string = "";
  fax : string = "";
  isSelected:boolean = false;
  id: string = "";
  crtdt: string = "";
  rnwdt : string = "";
  fano : string = "";
  memberinfo:any[];
}