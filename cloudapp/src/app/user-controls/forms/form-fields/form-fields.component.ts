import { Component, Input } from '@angular/core';
import { SearchField, SelectSearchField, SearchFieldTypes, MultiSearchField } from '../../search-form/search-form-utils';


@Component({
    selector: 'form-fields',
    templateUrl: './form-fields.component.html',
    styleUrls: ['./form-fields.component.scss']
  })

export class FormFieldsComponent {
    
    @Input() formFields: Array<SearchField>;
    @Input() minOccurrence: number;
    @Input() maxOccurrence: number;
    searchFieldType: typeof SearchFieldTypes = SearchFieldTypes;


    isSelectedSearchField(value) : SearchFieldTypes {
      if(value instanceof SelectSearchField) {
        return SearchFieldTypes.select;
      } else if(value instanceof MultiSearchField) {
        return SearchFieldTypes.multi;
      } else {
        return SearchFieldTypes.input;
      }
    }
}




