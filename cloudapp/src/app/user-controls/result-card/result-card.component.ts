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
  private titleDisplay: Array<ViewField>;
  private contentDisplay: Array<ViewLine>

  constructor() { }

  ngOnInit() {
    this.titleDisplay = this.record.initTitleDisplay().getContent();
    this.contentDisplay = this.record.initContentDisplay();
  }

  onActionsClick(recordIndex: number, actionIndex: number) {
    this.onActionSelected.emit(new RecordSelection(recordIndex, actionIndex));
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
  constructor (
    public recordIndex: number,
    public actionIndex: number
  ) { }
}

export class Action {
  label: string;
  avliableForAll : boolean;

  constructor(label : string, avliableForAll : boolean = true) {
    this.label = label;
    this.avliableForAll = avliableForAll;
  }
}