import { Component, Input, Output, EventEmitter ,ViewChild,OnChanges,AfterViewInit} from '@angular/core';
import { PageEvent ,MatPaginator} from '@angular/material/paginator';
import { IDisplayLines } from '../../service/ill.service';
import { RecordSelection } from '../record-card/record-card.component';

@Component({
    selector: 'records-list',
    templateUrl: './records-list.component.html',
    styleUrls: ['./records-list.component.scss']
  })

export class RecordsListComponent implements OnChanges, AfterViewInit{

  
  @Input() pageIndex: number;
  @Input() pageSize: number;
  @Input() recordsSummaryDisplay: Array<IDisplayLines> = new Array();
  @Output() onActionSelected = new EventEmitter<RecordSelection>();  
  @Output() onTitleSelected = new EventEmitter<number>();  
  @Output() onRadioSelected = new EventEmitter<IDisplayLines>();  
  @Output() onPageSelected = new EventEmitter<PageEvent>();  

  @ViewChild(MatPaginator) paginator: MatPaginator;
  recordIndex: number ;

  constructor() { }

  ngAfterViewInit() {
    this.setPageVariables();
  }
  
  ngOnChanges() {
    this.recordIndex = 0;
  }

  onActionsClick(selection: RecordSelection) {
    selection.recordIndex = selection.recordIndex - this.recordIndex; // Geting omly the for loop's index (i)
    this.onActionSelected.emit(selection);
  }

  setPageVariables() {}


  onPageAction(pageEvent: PageEvent) {
    this.onPageSelected.emit(pageEvent);
  }
    
  onRadioClick(item : IDisplayLines) {
    this.onRadioSelected.emit(item);
 }
    
}


