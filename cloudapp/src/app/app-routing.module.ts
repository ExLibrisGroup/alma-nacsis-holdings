import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { HoldingsComponent } from './holdings/holdings.component';
import { FormComponent } from './form/form.component';
import { ConfigurationComponent } from './configuration/configuration.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'configuration', component: ConfigurationComponent },
  { path: 'holdings/:mmsId', component: HoldingsComponent },
  { path: 'holdings/:mmsId/edit/:id', component: FormComponent },
  { path: 'holdings/:mmsId/new', component: FormComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
