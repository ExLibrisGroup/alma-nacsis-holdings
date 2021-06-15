import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule, getTranslateModule, AlertModule, MenuModule } from '@exlibris/exl-cloudapp-angular-lib';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './holdings/main/main.component';
import { FooterComponent } from './footer/footer.component';
import { HoldingsComponent } from './holdings/holdings/holdings.component';
import { FormComponent } from './holdings/form/form.component';
import { ConfigurationComponent } from './configuration/configuration.component';

import { FlexLayoutModule } from '@angular/flex-layout';

import {MatDialogModule} from '@angular/material/dialog';
import {ConfirmationDialog} from './dialog/confirmation-dialog.component';

import { HelpComponent } from './holdings/help/help.component';
import { MainMenuComponent } from './main-menu/main-menu.component';


export function getToastrModule() {
  return ToastrModule.forRoot({
    positionClass: 'toast-top-right',
    timeOut: 2000
  });
}

@NgModule({
   declarations: [
      AppComponent,
      MainComponent,
      FooterComponent,
      HoldingsComponent,
      FormComponent,
      ConfigurationComponent,
      ConfirmationDialog,
      HelpComponent,
      MainMenuComponent,
   ],
   entryComponents: [ConfirmationDialog],
   imports: [
      MaterialModule,
      MatDialogModule,
      BrowserModule,
      BrowserAnimationsModule,
      AppRoutingModule,
      HttpClientModule,
      FormsModule,
      ReactiveFormsModule,
      getTranslateModule(),
      getToastrModule(),
      FlexLayoutModule,
      AlertModule,
      MenuModule,
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
