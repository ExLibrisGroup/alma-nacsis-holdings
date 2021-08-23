import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IDisplayLinesSummary } from '../../catalog/results-types/results-common';


@Component({
    selector: 'result-card',
    templateUrl: './result-card.component.html',
    styleUrls: ['./result-card.component.scss']
  })

export class ResultCardComponent {

  @Input() index: number;
  @Input() record: IDisplayLinesSummary;
  @Input() resultActionList: Array<string> = new Array();
  @Output() onActionSelected = new EventEmitter<[number, IDisplayLinesSummary]>();  
  @Output() onTitleSelected = new EventEmitter<IDisplayLinesSummary>();  


  constructor() { }

  onActionsClick(actionIndex: number, record: IDisplayLinesSummary) {
    this.onActionSelected.emit([actionIndex, record]);
  }

  onTitleClick(record: IDisplayLinesSummary) {
    this.onTitleSelected.emit(record);
  }



    
}


