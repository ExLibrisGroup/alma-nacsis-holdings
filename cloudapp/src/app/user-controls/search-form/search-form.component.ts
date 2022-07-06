import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { SearchField, SelectSearchField } from './search-form-utils';
import { MatSelectChange } from '@angular/material/select';


@Component({
    selector: 'search-form',
    templateUrl: './search-form.component.html',
    styleUrls: ['./search-form.component.scss']
  })

export class SearchFormComponent implements OnChanges {

    @Input() databasesList: Array<string> = new Array();
    @Input() fieldsList: Array<SearchField> = new Array();
    @Input() currentDatabase: string ;
    @Output() selectedDatabase = new EventEmitter<string>();  

    constructor() { }
    
    ngOnChanges() {
      this.selectedDatabase.emit(this.currentDatabase);
    }

    selectDatabase(db: MatSelectChange) {
      this.selectedDatabase.emit(db.value);
    }

    isSelectedSearchField(value) : boolean {
      return value instanceof SelectSearchField;
    }


    
}


