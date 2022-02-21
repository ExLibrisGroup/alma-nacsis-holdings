import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SearchType } from '../../user-controls/search-form/search-form-utils';
import { LinkState } from '../../catalog/results-types/results-common';


@Component({
  selector: 'full-view-display',
  templateUrl: './full-view-display.component.html',
  styleUrls: ['./full-view-display.component.scss']
})

export class FullviewDisplayComponent {

  @Input() resultFullDisplay;
  @Output() onFullViewLinkSelected = new EventEmitter<FullViewLink>();

  linkState: typeof LinkState = LinkState;

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