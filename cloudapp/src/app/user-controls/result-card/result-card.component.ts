import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
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
  @Input() resultActionList: Array<Action>;
  @Output() onActionSelected = new EventEmitter<RecordSelection>(); 
  @Output() onEditRecord = new EventEmitter<RecordSelection>();  
  @Output() onTitleSelected = new EventEmitter<number>();  
  public titleDisplay: Array<ViewField>;
  public contentDisplay: Array<ViewLine>;


  constructor() { }

  ngOnInit() {
    this.titleDisplay = this.record.initTitleDisplay().getContent();
    this.contentDisplay = this.record.initContentDisplay();
  }

  onActionsClick(recordIndex: number, actionIndex: number, actionName: string) {
    this.onActionSelected.emit(new RecordSelection(recordIndex, actionIndex, actionName));
  }

  onEditClick(recordIndex: number) {
    this.onEditRecord.emit(new RecordSelection(recordIndex, null));
  }

  onTitleClick(recordIndex: number) {
    this.onTitleSelected.emit(recordIndex);
  }

  getResultActionList() {
    const isEditable = this.record.isEditable;
    return this.resultActionList.filter(
      action  => action.avliableForAll || isEditable);
  }
  
}

export class RecordSelection {
  recordIndex: number;
  actionIndex: number;
  actionName: string;
  constructor (recordIndex: number, actionIndex: number, actionName : string = '') {
    this.recordIndex = recordIndex;
    this.actionIndex = actionIndex;
    this.actionName = actionName;
   }
}

export class Action {
  label: string;
  avliableForAll : boolean;

  constructor(label : string, avliableForAll : boolean = true) {
    this.label = label;
    this.avliableForAll = avliableForAll;
  }
}