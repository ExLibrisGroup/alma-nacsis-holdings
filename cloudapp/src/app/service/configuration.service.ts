import { CloudAppConfigService } from "@exlibris/exl-cloudapp-angular-lib";
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ConfigurationService{
  private _config;

  constructor(
      private configService: CloudAppConfigService
    ) {
      this.configService.get().subscribe(resp => this._config = resp);
  }

  set config(config: any) {
    this._config = config;
  }

}