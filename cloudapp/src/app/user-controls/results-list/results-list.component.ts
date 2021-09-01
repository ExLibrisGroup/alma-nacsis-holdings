import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { IDisplayLines } from '../../catalog/results-types/results-common';
import { RecordSelection } from '../result-card/result-card.component';


@Component({
    selector: 'results-list',
    templateUrl: './results-list.component.html',
    styleUrls: ['./results-list.component.scss']
  })

export class ResultsListComponent implements OnChanges, AfterViewInit {

  @Input() numOfResults: number;
  @Input() resultsSummaryDisplay: Array<IDisplayLines> = new Array();
  @Input() resultActionList: Array<string> = new Array();
  @Output() onActionSelected = new EventEmitter<RecordSelection>();  
  @Output() onTitleSelected = new EventEmitter<number>();  
  @Output() onPageSelected = new EventEmitter<PageEvent>();  
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  private recordIndex: number;


  constructor() { }

  ngAfterViewInit() {
    this.setRecordIndex();
  }
  
  ngOnChanges() {
    this.setRecordIndex();
  }

  setRecordIndex() {
    this.recordIndex = this.paginator.pageIndex * this.paginator.pageSize;
  }

  onActionsClick(selection: RecordSelection) {
    this.onActionSelected.emit(selection);
  }

  onTitleClick(recordIndex: number) {
    this.onTitleSelected.emit(recordIndex);
  }

  onPageAction(pageEvent: PageEvent) {
    this.onPageSelected.emit(pageEvent);
  }
    


    
}


