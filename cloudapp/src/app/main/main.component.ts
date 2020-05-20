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
  }

  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  search() {
    if (this.selected) {
      this.router.navigate(['/holdings', this.selected]);
    }
  }
}
