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
    @Output() selectedDatabase = new EventEmitter<string>();  
    public defaultDatabase ;

    constructor() { }
    
    ngOnChanges() {
      this.defaultDatabase  = this.databasesList[0];
      this.selectedDatabase.emit(this.defaultDatabase );
    }

    selectDatabase(db: MatSelectChange) {
      this.selectedDatabase.emit(db.value);
    }

    isSelectedSearchField(value) : boolean {
      return value instanceof SelectSearchField;
    }


    
}


