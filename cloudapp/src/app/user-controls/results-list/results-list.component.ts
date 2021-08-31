import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IDisplayLines } from '../../catalog/results-types/results-common';
import { RecordSelection } from '../result-card/result-card.component';


@Component({
    selector: 'results-list',
    templateUrl: './results-list.component.html',
    styleUrls: ['./results-list.component.scss']
  })

export class ResultsListComponent {

  @Input() numOfResults: number;
  @Input() resultsSummaryDisplay: Array<IDisplayLines> = new Array();
  @Input() resultActionList: Array<string> = new Array();
  @Output() onActionSelected = new EventEmitter<RecordSelection>();  
  @Output() onTitleSelected = new EventEmitter<number>();  
  @Output() onPageSelected = new EventEmitter<PageEvent>();  


  constructor() { }

  onActionsClick(selection: RecordSelection) {
    this.onActionSelected.emit(selection);
  }

  onTitleClick(recordIndex: number) {
    this.onTitleSelected.emit(recordIndex);
  }

  onPageAction(pageEvent: PageEvent) {
    this.onPageSelected.emit(pageEvent);
  }
    


    
}


