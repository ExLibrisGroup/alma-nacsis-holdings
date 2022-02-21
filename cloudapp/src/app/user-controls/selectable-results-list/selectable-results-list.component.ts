import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { IDisplayLines, ViewLine, ViewField  } from '../../catalog/results-types/results-common';
import { RecordSelection } from '../selectable-result-card/selectable-result-card.component';
import { AlmaRecordDisplay} from '../../service/ill.service';

@Component({
    selector: 'selectable-results-list',
    templateUrl: './selectable-results-list.component.html',
    styleUrls: ['./selectable-results-list.component.scss']
  })

export class SelectableResultsListComponent implements OnChanges, AfterViewInit {

  @Input() numOfResults: number;
  @Input() pageIndex: number;
  @Input() pageSize: number;
  @Input() resultsSummaryDisplay: Array<IDisplayLines> = new Array();
  @Input() resultActionList: Array<string> = new Array();
  @Output() onActionSelected = new EventEmitter<RecordSelection>();  
  @Output() onTitleSelected = new EventEmitter<number>();  
  @Output() onPageSelected = new EventEmitter<PageEvent>();  
  @Output() onRadioSelected = new EventEmitter<IDisplayLines>();  
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  recordIndex: number;


  constructor() { }

  ngAfterViewInit() {
    this.setPageVariables();
  }
  
  ngOnChanges() {
    if(this.paginator == undefined) { // For case that ngOnChanges() is called at initialization
      this.recordIndex = 0;
    } else{
      this.setPageVariables();
    }
  }

  setPageVariables() {
    this.paginator.pageIndex = this.pageIndex;
    this.paginator.pageSize = this.pageSize;
    this.recordIndex = this.pageIndex * this.pageSize;
  }

  onActionsClick(selection: RecordSelection) {
    selection.recordIndex = selection.recordIndex - this.recordIndex; // Geting omly the for loop's index (i)
    this.onActionSelected.emit(selection);
  }

  onTitleClick(recordIndex: number) {
    recordIndex = recordIndex - this.recordIndex; // Geting omly the for loop's index (i)
    this.onTitleSelected.emit(recordIndex);
  }

  onPageAction(pageEvent: PageEvent) {
    this.onPageSelected.emit(pageEvent);
  }
    
  onRadioClick(item : IDisplayLines) {
    this.onRadioSelected.emit(item);
 }

    
}


