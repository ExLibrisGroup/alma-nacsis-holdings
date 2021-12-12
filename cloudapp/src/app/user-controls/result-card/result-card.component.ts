import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IDisplayLines, ViewLine, ViewField } from '../../catalog/results-types/results-common';


@Component({
    selector: 'result-card',
    templateUrl: './result-card.component.html',
    styleUrls: ['./result-card.component.scss']
  })

export class ResultCardComponent implements OnInit {

  @Input() recordIndex: number;
  @Input() record: IDisplayLines;
  @Input() resultActionList: Array<string> = new Array();
  @Output() onActionSelected = new EventEmitter<RecordSelection>();  
  @Output() onTitleSelected = new EventEmitter<number>();  
  public titleDisplay: Array<ViewField>;
  public contentDisplay: Array<ViewLine>;


  constructor() { }

  ngOnInit() {
    this.titleDisplay = this.record.initTitleDisplay().getContent();
    this.contentDisplay = this.record.initContentDisplay();
  }

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



