import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CloudAppConfigService } from '@exlibris/exl-cloudapp-angular-lib';
//import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { HoldingsService } from '../service/holdings.service';
import { ConfigurationService } from '../service/configuration.service';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';


@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  form: FormGroup;
  saving = false;
  
  constructor(
    private fb: FormBuilder,
    private configService: CloudAppConfigService,
    //private toastr: ToastrService,
    private translate: TranslateService,
    private nacsis: ConfigurationService,
    private alert: AlertService

  ) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.configService.getAsFormGroup().subscribe( config => {
      this.form = Object.keys(config.value).length==0
        ? this.fb.group({
            code: this.fb.control('')
          })
        : config;
      });
  }

  save() {
    this.saving = true;
    this.nacsis.config = this.form.value;
    this.configService.set(this.form.value).subscribe(
      () => {
        this.alert.success(this.translate.instant('Config.Success'), {keepAfterRouteChange:true});  

        this.form.markAsPristine();
      },
      err => this.alert.error(err.message, {keepAfterRouteChange:true}),
      ()  => this.saving = false
    );
  }  

}
