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

  setBaseUrl(initData: InitData) : string {
    let baseUrl = super.setBaseUrl(initData);
    baseUrl = baseUrl + "members?";
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