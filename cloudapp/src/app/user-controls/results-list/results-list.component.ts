import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IDisplayLinesSummary } from '../../catalog/results-types/results-common';


@Component({
    selector: 'results-list',
    templateUrl: './results-list.component.html',
    styleUrls: ['./results-list.component.scss']
  })

export class ResultsListComponent {

  @Input() numOfResults: number;
  @Input() resultsSummaryDisplay: Array<IDisplayLinesSummary> = new Array();
  @Input() resultActionList: Array<string> = new Array();
  @Output() onActionSelected = new EventEmitter<[number, IDisplayLinesSummary]>();  
  @Output() onTitleSelected = new EventEmitter<IDisplayLinesSummary>();  
  @Output() onPageSelected = new EventEmitter<PageEvent>();  


  constructor() { }

  onActionsClick(selection: any) {
    this.onActionSelected.emit(selection);
  }

  onTitleClick(result: IDisplayLinesSummary) {
    this.onTitleSelected.emit(result);
  }

  onPageAction(pageEvent: PageEvent) {
    this.onPageSelected.emit(pageEvent);
  }
    


    
}


