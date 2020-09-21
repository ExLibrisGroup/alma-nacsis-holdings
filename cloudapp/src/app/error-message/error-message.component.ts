
import { Component, Input, Output, EventEmitter } from '@angular/core'; // First, import Input


@Component({
    selector: 'error-message-inpu-output',
    templateUrl: 'error-message.component.html',
    styleUrls: ['error-message.component.scss']
  })
export class ErrorMessageComponent {
  @Input() title: string; 
  @Input() message: string; 

  @Output() onCloseEvent = new EventEmitter();

  onCloseClick() {
    this.onCloseEvent.emit();
  }

}