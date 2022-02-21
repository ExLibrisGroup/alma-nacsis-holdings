import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { IDisplayLines, ViewLine, ViewField } from '../../catalog/results-types/results-common';
import { AlmaRecordDisplay} from '../../service/ill.service';

@Component({
    selector: 'selectable-result-card',
    templateUrl: './selectable-result-card.component.html',
    styleUrls: ['./selectable-result-card.component.scss']
  })

export class SelectableResultCardComponent implements OnInit {

  @Input() recordIndex: number;
  @Input() record: IDisplayLines;
  @Input() resultActionList: Array<string> = new Array();
  @Output() onActionSelected = new EventEmitter<RecordSelection>();  
  @Output() onTitleSelected = new EventEmitter<number>();  
  @Output() onRadioSelected = new EventEmitter<IDisplayLines>(); 
  titleDisplay: Array<ViewField>;
  contentDisplay: Array<ViewLine>;


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

  onRadioClick(record: IDisplayLines) {
    this.onRadioSelected.emit(record);
 }
  
}


export class RecordSelection {
  constructor (
    public recordIndex: number,
    public actionIndex: number
  ) { }
}



