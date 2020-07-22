import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CloudAppEventsService, Entity, EntityType } from '@exlibris/exl-cloudapp-angular-lib';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  private pageLoad$: Subscription;
  bibs: Entity[] = [];
  selected: string;

  constructor(
    private eventsService: CloudAppEventsService,
    private router: Router
  ) { }

  ngOnInit() {
    this.pageLoad$ = this.eventsService.onPageLoad( pageInfo => {
      this.bibs = (pageInfo.entities||[]).filter(e=>e.type==EntityType.BIB_MMS);
    });
    this.eventsService.getInitData().subscribe(
      data => {
        console.log(data);
        // this.welcomeText = data.user.lastName;
        // if (data.user.isAdmin) {
        //   this.welcomeText += " (you are Admin)";
        // }
      }
    );
  }

  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  search() {
    if (this.selected) {
      // TODO should be single bib, rest call return the same id for all bibs???
      var bib = this.bibs.filter(bib => bib.id == this.selected);
      this.router.navigate(['/holdings', this.selected, bib[0].description]);
    }
  }
}
