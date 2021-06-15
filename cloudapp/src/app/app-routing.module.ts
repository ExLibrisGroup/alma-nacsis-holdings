import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './holdings/main/main.component';
import { HoldingsComponent } from './holdings/holdings/holdings.component';
import { FormComponent } from './holdings/form/form.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { HelpComponent } from './holdings/help/help.component';
import { MainMenuComponent } from './main-menu/main-menu.component';

const routes: Routes = [
  { path: '', component: MainMenuComponent },
  { path: 'holdings', component: MainComponent },
  { path: 'configuration', component: ConfigurationComponent },
  { path: 'holdings/:mmsId/:mmsTitle', component: HoldingsComponent },
  { path: 'holdings/:mmsId/edit/:holdingId/:mmsTitle', component: FormComponent },
  { path: 'holdings/:mmsId/new/:mmsTitle', component: FormComponent },
  { path: 'holdings/:mmsId/view/:holdingId/:mmsTitle', component: FormComponent },
  { path: 'help', component: HelpComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
