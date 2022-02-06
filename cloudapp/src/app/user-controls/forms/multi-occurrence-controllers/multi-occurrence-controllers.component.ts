import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';


@Component({
    selector: 'multi-occurrence-controllers',
    templateUrl: './multi-occurrence-controllers.component.html',
    styleUrls: ['./multi-occurrence-controllers.component.scss']
  })

export class MultiOccurrenceControllersComponent implements OnChanges {
    
    @Input() isAddEnabled: boolean;
    @Input() isDeleteEnabled: boolean;
    @Output() selectedController = new EventEmitter<any>();
    private controllersList: Array<any>;

    ngOnChanges() {
        this.controllersList = new Array();
        if(this.isAddEnabled) {
            this.controllersList.push(ControllerButton.add);
        }
        if(this.isAddEnabled) {
            this.controllersList.push(ControllerButton.copy);
        }
        if(this.isDeleteEnabled) {
            this.controllersList.push(ControllerButton.delete);
        }
    }

    onControllerClick(controllerIcon: any) {
        this.selectedController.emit(controllerIcon);
    }


}

export const ControllerButton = {
    add: {iconName: "uxf-icon uxf-plus-circle", className: "add-controller"},
    copy: {iconName: "uxf-icon uxf-popup", className: "copy-controller"}, // optional - uxf-docs, uxf-doc-add
    delete: {iconName: "uxf-icon uxf-trash eca-button", className: "delete-controller"},
}



