import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IDisplayLines, AlmaRecordDisplay } from '../../service/ill.service';


@Component({
    selector: 'record-card',
    templateUrl: './record-card.component.html',
    styleUrls: ['./record-card.component.scss']
  })

export class RecordCardComponent {

  @Input() recordIndex: number;
  @Input() record: AlmaRecordDisplay;
  @Output() onTitleSelected = new EventEmitter<number>();  
  @Output() onRadioSelected = new EventEmitter<IDisplayLines>();  

  constructor() { }

  ngOnInit() {}


  onRadioClick(item : IDisplayLines) {
    this.onRadioSelected.emit(item);
 }

}


export class RecordSelection {
  constructor (
    public recordIndex: number,
    public actionIndex: number
  ) { }
}



