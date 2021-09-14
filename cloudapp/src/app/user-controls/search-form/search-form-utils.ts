import { FormControl } from "@angular/forms";


export enum SearchType {
    Monographs = "Monographs",
    Serials = "Serials",
    Names = "Names",
    UniformTitles = "UniformTitles",
    Member = "Member"
}

export class SearchField {

    key: FieldName;
    fieldLabel: string;
    formControl: FormControl;
    fieldLength: FieldSize = FieldSize.fullWidth;

    constructor(key: FieldName, fieldSize?: FieldSize){
        this.key = key;
        this.formControl = new FormControl();
        this.fieldLength = fieldSize;
    }

    getKey(): string {
        return this.key;
    }

    getFieldLabel(): string {
        this.fieldLabel = "UserControls.Fields." + this.key;
        return this.fieldLabel;
    }

    getFormControl(): FormControl {
        return this.formControl;
    }

    setFormControl(data: string) {
        this.formControl.setValue(data);
    }

    getFieldLength(): string {
        return this.fieldLength;
    }

    setFieldLength(size: FieldSize) {
        this.fieldLength = size;
    }
}

export enum FieldSize {
    fullWidth = "form-card-field-full-width",
    large = "form-card-field-large",
    medium = "form-card-field-medium",
    small = "form-card-field-small"
}

export enum FieldName {
    TITLE = "TITLE",
    FTITLE = "FTITLE",
    PTBL = "PTBL",
    VOL = "VOL",
    AUTH = "AUTH",
    ISSN = "ISSN",
    ISBN = "ISBN",
    NBN = "NBN",
    NDLCN = "NDLCN",
    PUB = "PUB",
    YEAR = "YEAR",
    PLACE = "PLACE",
    CNTRY = "CNTRY",
    LANG = "LANG",
    SH = "SH",
    AKEY = "AKEY",
    ID = "ID",
    PID = "PID",
    CODEN = "CODEN",
    NDLPN = "NDLPN",
    LCCN = "LCCN",
    FID = "FID",
    DATE = "DATE",
    SAID = "SAID",
}


