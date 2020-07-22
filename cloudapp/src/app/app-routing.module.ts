import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { HoldingsComponent } from './holdings/holdings.component';
import { FormComponent } from './form/form.component';
import { ConfigurationComponent } from './configuration/configuration.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'configuration', component: ConfigurationComponent },
  { path: 'holdings/:mmsId/:mmsTitle', component: HoldingsComponent },
  { path: 'holdings/:mmsId/edit/:id/:mmsTitle', component: FormComponent },
  { path: 'holdings/:mmsId/new/:mmsTitle', component: FormComponent },
  { path: 'holdings/:mmsId/view/:id/:mmsTitle', component: FormComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
