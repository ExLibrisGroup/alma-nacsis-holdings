import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IDisplayLinesSummary } from '../../catalog/results-types/results-common';


@Component({
    selector: 'result-card',
    templateUrl: './result-card.component.html',
    styleUrls: ['./result-card.component.scss']
  })

export class ResultCardComponent {

  @Input() recordIndex: number;
  @Input() record: IDisplayLinesSummary;
  @Input() resultActionList: Array<string> = new Array();
  @Output() onActionSelected = new EventEmitter<RecordSelection>();  
  @Output() onTitleSelected = new EventEmitter<number>();  


  constructor() { }

  onActionsClick(recordIndex: number, actionIndex: number) {
    this.onActionSelected.emit(new RecordSelection(recordIndex, actionIndex));
  }

  onTitleClick(recordIndex: number) {
    this.onTitleSelected.emit(recordIndex);
  }
  
}


export class RecordSelection {
  constructor (
    public recordIndex: number,
    public actionIndex: number
  ) { }
}



