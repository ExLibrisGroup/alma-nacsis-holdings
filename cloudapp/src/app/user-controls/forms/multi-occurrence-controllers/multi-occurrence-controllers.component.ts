import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { ControllerButton } from '../form-multi-occurrence/form-multi-occurrence.component';



@Component({
    selector: 'multi-occurrence-controllers',
    templateUrl: './multi-occurrence-controllers.component.html',
    styleUrls: ['./multi-occurrence-controllers.component.scss']
  })

export class MultiOccurrenceControllersComponent implements OnChanges {
    
    @Input() isAddEnabled: boolean;
    @Input() isDeleteEnabled: boolean;
    @Input() disabled: boolean = false;
    @Output() selectedController = new EventEmitter<any>();
    controllersEnabledMap = this.initControllers();
    
    initControllers() {
        let controllers = new Map([
        [ControllerButton.add, true],
        [ControllerButton.copy, true],
        [ControllerButton.delete, true]
        ]);
    return controllers;
    }



    ngOnChanges() {
        this.controllersEnabledMap = this.initControllers();
        if(!this.isAddEnabled) {
            this.controllersEnabledMap.set(ControllerButton.add, false);
            this.controllersEnabledMap.set(ControllerButton.copy, false);
        }
        if(!this.isDeleteEnabled) {
            this.controllersEnabledMap.set(ControllerButton.delete, false);

        }
    }

    onControllerClick(controllerIcon: any) {
        this.selectedController.emit(controllerIcon);
    }


}
