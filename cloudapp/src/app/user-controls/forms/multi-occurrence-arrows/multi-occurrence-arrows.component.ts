import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { ControllerButton } from '../form-multi-occurrence/form-multi-occurrence.component';


@Component({
    selector: 'multi-occurrence-arrows',
    templateUrl: './multi-occurrence-arrows.component.html',
    styleUrls: ['./multi-occurrence-arrows.component.scss']
  })

export class MultiOccurrenceArrowsComponent implements OnChanges {
    
    @Input() isFirstOccurrence: number;
    @Input() isLastOccurrence: number;
    @Input() disabled: boolean = false;
    @Output() selectedController = new EventEmitter<any>();

    private controllersEnabledMap = this.initControllers(); 

    initControllers() {
        let controllers = new Map([
            [ControllerButton.upward, true],
            [ControllerButton.downward, true]
        ]);
        return controllers;
    }


    ngOnChanges() {
        this.controllersEnabledMap = this.initControllers();
        if(this.isFirstOccurrence) {
            this.controllersEnabledMap.set(ControllerButton.upward, false);
        }
        if(this.isLastOccurrence) {
            this.controllersEnabledMap.set(ControllerButton.downward, false);
        }
    }
    
    onControllerClick(controllerIcon: any) {
        this.selectedController.emit(controllerIcon);
    }
}
