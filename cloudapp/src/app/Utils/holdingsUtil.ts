import { BaseUtil } from "./baseUtil";
import { Injectable } from '@angular/core';
@Injectable({
  providedIn:'root'
})
export class HoldingsUtil extends BaseUtil {
}

export class HeaderHolding {
  status: string = ""
  errorMessage: string = ""
  BID: string = ""
  holdingId = ""
  FANO: string = "" // library id
  LIBABL: string = "" // library name
  type: string = "" // BOOK/SERIAL
  nacsisRecordList: any[];
}

export class Holding {
  ID: string = "";
  CRTDT: string = "";
  RNWDT: string = "";
  BID: string = "";
  description: string = "";
  LIBABL: string = "";
  FANO: string = "";
  LOC: string = "";
  ill: boolean = false;
  libraryFullName: string;
  info: string;
  nacsisHoldingsList: any[];
  editable: boolean;
  type: string;
  ltrList: string[];
}

export class HoldingsBook {
  VOL: string = "";
  CLN: string = "";
  RGTN: string = "";
  CPYR: string = "";
  CPYNT: string = "";
  LDF: string = "";
}

export class HoldingsSerial {
  HLYR: string = "";
  HLV: string = "";
  CONT: string = "";
  CLN: string = "";
  LDF: string = "";
  CPYNT: string = "";
}

export class HoldingsSearch {
  nacsisId:string = "";//Nacsis id
  FANO: string = ""; //Participating organization code
  VOL: string = ""; //Volume
  YEAR:string = ""; //Year
  LOC: string = "";//Location
  _KENCODE_: string = ""; //Region (prefecture) code
  _SETCODE_: string = ""; //Establisher type
  _ORGCODE_: string = ""; //Institution type
  _GRPCODE_: string = ""; //Offset charge
  _ILLFLG_: string = ""; //ILL participation type
  _STAT_: string = ""; //Service status
  _COPYS_: string = ""; //Copy service type
  _LOANS_: string = ""; //Lending service type
  _FAXS_: string = ""; //FAX service type
  owner: string = ""; //Owner
}

export class NacsisHoldingRecord{
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

export class volDetails {
  
}

export class NacsisBookHoldingsListDetail {
  index:number;
  VOL: string = "";
  CLN: string = "";
  RGTN: string = "";
  CPYR: string = "";
  LDF: string = "";
  CPYNT: string = "";
}

export class NacsisSerialHoldingsListDetail {
  index:number;
  HLYR: string = "";
  HLV: string = "";
  CONT: string = "";
  CLN: string = "";
  LDF: string = "";
  CPYNT: string = "";
}

export class DisplayHoldingResult{
  index: number;
  name: string = "";
  vol: any[];//book only
  hlv: string = "";//serial only
  hlyr: string = "";//serial only
  cln: string = "";//serial only
  ldf: string = "";//serial only
  region: string = "";
  regionCode: string = "";
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


const HOLDINGS = [
  {
    "ID": "holding1",
    "BID": "BID1",
    "description": "Main holding",
    "LIBABL": "Main",
    "LOC": "Stacks",
    "FANO": "fano1",
    "ill": true,
    "libraryFullName": "Main (fano1)",
    "info": "info1"
  },
  {
    "ID": "holding2",
    "BID": "BID2",
    "description": "Reading room",
    "LIBABL": "RR",
    "LOC": "Room",
    "FANO": "fano2",
    "ill": false,
    "libraryFullName": "RR (fano2)",
    "info": "info2"
  }
];

