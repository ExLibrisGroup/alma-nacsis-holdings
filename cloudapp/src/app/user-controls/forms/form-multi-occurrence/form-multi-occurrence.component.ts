import { Component, OnChanges, Input } from '@angular/core';
import { SearchField, FieldName, FieldSize } from '../../search-form/search-form-utils';

import { FormControl } from "@angular/forms";

@Component({
    selector: 'form-multi-occurrence',
    templateUrl: './form-multi-occurrence.component.html',
    styleUrls: ['./form-multi-occurrence.component.scss']
  })

export class FormMultiOccurrenceComponent {
    @Input() minOccurrence: number;
    @Input() maxOccurrence: number;
    @Input() contentArray: Array<Array<SearchField>>;


    isLastOccurrence(index: number): boolean {
        if(this.maxOccurrence != undefined && index == (this.maxOccurrence-1)) {
            return false;
        } else {
            return true;
        }
    }

    isFirstOccurrence(index: number): boolean {
        if(this.minOccurrence != undefined && index <= (this.minOccurrence-1)) {
            return false;
        } else {
            return true;
        }
    }

    onControllerClick(controllerButtom: any, index: number) {

        switch(controllerButtom) {
            case(ControllerButton.upward):
                if(index > 0){
                    [this.contentArray[index], this.contentArray[index-1]] = [this.contentArray[index-1], this.contentArray[index]];
                }
                break;
            case(ControllerButton.downward):
                if(index < this.contentArray.length-1){
                    [this.contentArray[index], this.contentArray[index+1]] = [this.contentArray[index+1], this.contentArray[index]];
                }
                break;
            case(ControllerButton.add):
                this.setAdditionalContent(index, this.copySearchFieldsArray(this.contentArray[index], false)); 
                break;
            case(ControllerButton.delete):
                this.contentArray.splice(index, 1);
                break;
            case(ControllerButton.copy):
                this.setAdditionalContent(index, this.copySearchFieldsArray(this.contentArray[index], true)); 
                break;
        }
    }

    copySearchFieldsArray(oldArr: Array<SearchField>, copyFormControlValues: boolean): Array<SearchField> {
        let newArr = new Array<SearchField>();
        oldArr?.forEach(oldField => {
            newArr.push(oldField.copyField(copyFormControlValues));
        });
        return newArr;
    }

    setAdditionalContent(i: number, content: any) {
        if(this.isLastOccurrence(this.contentArray.length-1)) {
            this.contentArray.splice(i+1, 0, content);
        }
    }

    // Checking if all fields are in readOnly mode
    isReadOnlyMode(index: number): boolean {
        let fieldsInReadOnlyMode = this.contentArray[index].filter(field => field.getReadOnly());
        return fieldsInReadOnlyMode.length == this.contentArray[index].length;
    }
    
}


export const ControllerButton = {
    add: {iconName: "uxf-icon uxf-plus-circle", className: "add-controller"},
    copy: {iconName: "uxf-icon uxf-popup", className: "copy-controller"}, // optional - uxf-docs, uxf-doc-add
    delete: {iconName: "uxf-icon uxf-trash", className: "delete-controller"},
    upward: {iconName: "keyboard_arrow_up", className: "upward-controller"},
    downward: {iconName: "keyboard_arrow_down", className: "downward-controller"},
}