import { FormControl } from "@angular/forms";


export class SearchField {

    key: FieldName;
    fieldLabel: string;
    formControl: FormControl;
    fieldLength: FieldSize = FieldSize.regular;

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


export enum SearchType {
    Monographs = "Monographs",
    Serials = "Serials",
    Names = "Names",
    UniformTitles = "UniformTitles",
    Member = "Member"
}

export enum QueryParams {
    PageIndex = "pageIndex",
    PageSize = "pageSize",
    SearchType = "searchType",
    Databases = "dataBase",
    ID = "ID"
}

export enum FieldSize {
    regular = "form-card-child-regular",
    large = "form-card-child-large"
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


