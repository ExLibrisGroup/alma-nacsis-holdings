import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SearchType } from '../../user-controls/search-form/search-form-utils';


@Component({
  selector: 'full-view-display-member',
  templateUrl: './full-view-display-member.component.html',
  styleUrls: ['./full-view-display-member.component.scss']
})

export class FullviewDisplayOfMemComponent {

  @Input() resultFullDisplay;
  @Output() onFullViewLinkSelected = new EventEmitter<FullViewLink>();


  constructor() { }

  onFullViewLink(searchType: SearchType, linkID: string) {
    this.onFullViewLinkSelected.emit(new FullViewLink(searchType, linkID));
  }

  isEvenRow(i: number) {
    if (i % 2 == 0) {
      return "even";
    }
  }

}


export class FullViewLink {
  constructor (
    public searchType: SearchType,
    public linkID: string
  ) { }
}