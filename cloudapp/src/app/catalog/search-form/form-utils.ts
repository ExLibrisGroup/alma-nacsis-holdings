import { FormControl } from "@angular/forms";


export class SearchItem {
    _key: string;
    _fieldLabel: string;
    _formControl: FormControl;

    constructor(key:string, entity:SearchType){
        this._key = key;
        this._fieldLabel = "Catalog.Form." + entity + ".Field." + key;
        this._formControl = new FormControl();
    }
    
    getKey(): string {
        return this._key;
    }

    getFieldLabel() : string {
        return this._fieldLabel;
    }

    getFormControl() : FormControl {
        return this._formControl;
    }
}


export enum SearchType {
    Monographs = "Monographs",
    Serials = "Serials",
    Names = "Names",
    UniformTitles = "UniformTitles"
}
