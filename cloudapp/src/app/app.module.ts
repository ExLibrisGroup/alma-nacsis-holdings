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
import { RecordsListComponent } from './user-controls/records-list/records-list.component';
import { RecordCardComponent } from './user-controls/record-card/record-card.component';
import { SelectableResultsListComponent } from './user-controls/selectable-results-list/selectable-results-list.component';
import { SelectableResultCardComponent } from './user-controls/selectable-result-card/selectable-result-card.component';
import { MultiOccurrenceControllersComponent } from './user-controls/forms/multi-occurrence-controllers/multi-occurrence-controllers.component';
import { FormMultiOccurrenceComponent } from './user-controls/forms/form-multi-occurrence/form-multi-occurrence.component';
import { FormFieldsComponent } from './user-controls/forms/form-fields/form-fields.component';


// ILL
import { ILLBorrowingMainComponent } from './ILL/main/main.component';
import { searchRecordComponent } from './ILL/searchRecord/searchRecord.component';
import { HoldingSearchComponent } from './ILL/holdingSearch/holdingSearch.component';
import { RequestFormComponent } from './ILL/requestForm/requestForm.component';
import { FullviewDisplayOfMemComponent } from './ILL/full-view-display-member/full-view-display-member.component';

// Members 
import { MembersSearchComponent } from './members/main/main.component';

//Paginator
import {MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { PaginatorIntlService } from './service/paginator.translate';

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
      ILLBorrowingMainComponent,
      RecordsListComponent,
      RecordCardComponent,
      searchRecordComponent,
      SelectableResultsListComponent,
      SelectableResultCardComponent,
      HoldingSearchComponent,
      RequestFormComponent,
      FullviewDisplayOfMemComponent,
      MembersSearchComponent,
      MultiOccurrenceControllersComponent,
      FormMultiOccurrenceComponent,
      FormFieldsComponent
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
   providers: [
      {
         provide: MatPaginatorIntl,
         useClass: PaginatorIntlService,
       },
   ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
