import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IDisplayLines} from '../../service/ill.service';


@Component({
    selector: 'record-card',
    templateUrl: './record-card.component.html',
    styleUrls: ['./record-card.component.scss']
  })

export class RecordCardComponent {

  @Input() recordIndex: number;
  @Input() record: IDisplayLines;
  @Output() onTitleSelected = new EventEmitter<number>();  
  @Output() onRadioSelected = new EventEmitter<IDisplayLines>();  

  constructor() { }

  ngOnInit() {}

  onTitleClick(recordIndex: number) {
    this.onTitleSelected.emit(recordIndex);
  }

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



