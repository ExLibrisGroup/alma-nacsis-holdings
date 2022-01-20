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
  @Input() pageIndex: number;
  @Input() pageSize: number;
  @Input() resultsSummaryDisplay: Array<IDisplayLines> = new Array();
  @Input() resultActionList: Array<string> = new Array();
  @Input() enableEdit: boolean;
  @Input() enableDelete: boolean;
  @Output() onActionSelected = new EventEmitter<RecordSelection>();  
  @Output() onTitleSelected = new EventEmitter<number>();  
  @Output() onPageSelected = new EventEmitter<PageEvent>();  
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  private recordIndex: number;


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
    


    
}


