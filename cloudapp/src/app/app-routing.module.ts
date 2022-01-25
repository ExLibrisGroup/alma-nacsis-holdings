import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './holdings/main/main.component';
import { HoldingsComponent } from './holdings/viewHoldings/viewHoldings.component';
import { FormComponent } from './holdings/form/form.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { HelpComponent } from './holdings/help/help.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { CatalogMainComponent } from './catalog/main/main.component';
import { ILLBorrowingMainComponent } from './ILL/main/main.component';
import { searchRecordComponent } from './ILL/searchRecord/searchRecord.component';
import { HoldingSearchComponent } from './ILL/holdingSearch/holdingSearch.component';
import { RequestFormComponent } from './ILL/requestForm/requestForm.component';
import { MembersSearchComponent } from './members/main/main.component';
import { EditFormComponent } from './members/edit/edit.component';



const routes: Routes = [
  { path: '', component: MainMenuComponent },
  { path: 'holdings', component: MainComponent },
  { path: 'configuration', component: ConfigurationComponent },
  { path: 'holdings/:mmsId/:mmsTitle', component: HoldingsComponent },
  { path: 'holdings/:mmsId/edit/:holdingId/:mmsTitle', component: FormComponent },
  { path: 'holdings/:mmsId/new/:mmsTitle', component: FormComponent },
  { path: 'holdings/:mmsId/view/:holdingId/:mmsTitle', component: FormComponent },
  { path: 'help', component: HelpComponent },
  { path: 'catalog', component: CatalogMainComponent },
  { path: 'ILL', component: ILLBorrowingMainComponent },
  { path: 'members', component: MembersSearchComponent },
  { path: 'editMember', component: EditFormComponent },
  { path: 'searchRecord', component: searchRecordComponent },
  { path: 'searchRecord/:flagBack', component: searchRecordComponent },
  { path: 'searchRecord/:nacsisId/:title/:isbn/:issn', component: searchRecordComponent },
  { path: 'holdingSearch', component: HoldingSearchComponent },
  { path: 'holdingSearch/:nacsisId/:mmsTitle', component: HoldingSearchComponent },
  { path: 'holdingSearch/:nacsisId/:mmsTitle/:searchType', component: HoldingSearchComponent },
  { path: 'requestForm', component: RequestFormComponent },
  { path: 'requestForm/:nacsisId/:mmsTitle/:searchType', component: RequestFormComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
