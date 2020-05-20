import { HttpClient } from "@angular/common/http";
import { delay, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { CloudAppConfigService } from '@exlibris/exl-cloudapp-angular-lib';

@Injectable({
    providedIn: 'root'
})
export class NacsisService {
  /* Mock */
  private _holdings = HOLDINGS;
  private _config;

  constructor (
    private http: HttpClient,
    private configService: CloudAppConfigService
  ) {
    this.configService.get().subscribe(resp=>this._config = resp);
  }

  getHoldings(bib: any): Observable<Holding[]> {
    // extract NACSIS number from bib
    const nacsisId = bib.network_number.find( v => v.match(/^\(NACSIS\)\s*(\d+)\s*/))

    // simulate call to external service
    return of(this._holdings)
    .pipe(
      delay(1000) 
    )
  }

  getHolding(id: string): Observable<Holding> {
    return of(this._holdings)
    .pipe(
      map(holdings => holdings.find(holding=>holding.id === id)),
      delay(1000) 
    )
  }

  deleteHolding(id: string) {
    /* Mock */
    this._holdings.splice(this._holdings.findIndex(item => item.id === id), 1)
    return of(null).pipe(delay(1000));
  }

  saveHolding(holding: Holding) {
    /* Mock */
    const index = this._holdings.findIndex(obj => obj.id === holding.id);
    if (index >=0)
      this._holdings[index] = holding;
    else
      this._holdings.push(holding);
    return of(null).pipe(delay(1000));
  }

  set config(config: any) {
    this._config = config;
  }
}

export class Holding {
  id: string = ""; 
  description: string = "";
  library: string = "";
  location: string = "";
  ill: boolean = false
}

const HOLDINGS = [
  {
    "id": "holding1",
    "description": "Main holding",
    "library": "Main",
    "location": "Stacks",
    "ill": true
  },
  {
    "id": "holding2",
    "description": "Reading room",
    "library": "RR",
    "location": "Room",
    "ill": false
  }
];