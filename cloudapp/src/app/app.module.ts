import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule, getTranslateModule, AlertModule, MenuModule } from '@exlibris/exl-cloudapp-angular-lib';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule } from '@angular/material/dialog';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FooterComponent } from './footer/footer.component';
import { FormComponent } from './holdings/form/form.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import {ConfirmationDialog} from './dialog/confirmation-dialog.component';
import { MainMenuComponent } from './main-menu/main-menu.component';

// Holding
import { MainComponent } from './holdings/main/main.component';
import { HoldingsComponent } from './holdings/viewHoldings/viewHoldings.component';
import { HelpComponent } from './holdings/help/help.component';

// Catalog
import { CatalogMainComponent } from './catalog/main/main.component';
import { FullviewDisplayComponent } from './catalog/full-view-display/full-view-display.component';

// User Controls
import { SearchFormComponent } from './user-controls/search-form/search-form.component';
import { ResultsListComponent } from './user-controls/results-list/results-list.component';
import { ResultCardComponent } from './user-controls/result-card/result-card.component';




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
      CatalogMainComponent,
      SearchFormComponent,
      ResultsListComponent,
      ResultCardComponent,
      FullviewDisplayComponent,
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
