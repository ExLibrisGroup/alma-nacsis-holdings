import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'full-view-display',
  templateUrl: './full-view-display.component.html',
  styleUrls: ['./full-view-display.component.scss']
})

export class FullviewDisplayComponent {

  @Input() resultFullDisplay;
  @Output() onFullViewLinkSelected = new EventEmitter<string>();


  constructor() { }

  onFullViewLink() {
    this.onFullViewLinkSelected.emit("searchType");
  }

  isEvenRow(i: number) {
    if (i % 2 == 0) {
      return "even";
    }

  }
}

