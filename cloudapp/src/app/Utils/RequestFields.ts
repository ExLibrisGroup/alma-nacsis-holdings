export class RequestFields {
  ID: string[];
  _DBNAME_: string[];
  CRTDT: string[];
  RNWDT: string[];
  CRTUID: string[];
  RNWUID: string[];  
  BSFLG: string[];
  STAT: string[];
  ONO: string[];
  ANO: string[];
  CLAIMFLG: string[];
  LOANFLG: string[];
  ODATE: string[];
  ADATE: string[];
  SDATE: string[];
  RDATE: string[];
  DDATE: string[];
  BDATE: string[];  
  KDATE: string[];
  OMLID: string[];
  OMLNM: string[];
  AMLID: string[];
  AMLNM: string[];
  CLNT: string[];
  CLNTP: string[];
  SRVCE: string[];
  VLNO: string[];
  PAGE: string[];
  YEAR: string[];  
  ARTCL: string[];
  BVRFY: string[];
  HVRFY: string[];
  ACCT: string[];
  TYPE: string[];
  FEE: string[];
  POSTG: string[];
  SUM: string[];
  SPVIA: string[];
  PRMT: string[];
  OSTAF: string[];
  ASTAF: string[];
  OLDF: string[];
  OLDAF: string[];
  ALDF: string[];
  OADRS: string[];
  AADRS: string[];
  IRUID: string[];
  OMLIDS: string[];
  AMLIDS: string[];
  _COMMENT_: string[];
  EXTERNAL_ID: string = "";

  BIBG: BIBG[];
  HMLG: HMLG[];
  SENDG : SENDG[];
  CHG : CHG[];
}

export class BIBG {
  BIBID: string = "";
  BIBNT: string = "";
  STDNO: string = "";
}

export class HMLG {
  HMLID: string = "";
  HMLNM: string = "";
  LOC: string = "";
  VOL: string = "";
  CLN: string = "";
  RGTN: string = "";
}

export class SENDG {
  SENDCMND: string = "";
  SENDMLID: string = "";
  SENDCMNT: string = "";
}

export class CHG {
  ITEM: string = "";
  UPRCE: string = "";
  QNT: string = "";
  CHRGE: string = "";
}