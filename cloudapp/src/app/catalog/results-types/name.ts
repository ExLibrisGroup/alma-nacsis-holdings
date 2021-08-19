import { TranslateService } from '@ngx-translate/core';
import { IDisplayLinesSummary, BaseResult, IDisplayLinesFull, FullViewField, FullViewLine, FieldBuilder } from './results-common';


export class Name extends BaseResult {
    summaryView: NameSummary;
    fullView : NameFull;

    constructor(record: any){
        super(record);
    }
}

export class NameSummary{
    AUTH: string = "";
    DATE: string = "";
    ID: string = "";
}

export class NameFull{
    ID: string = "";
    CRTDT: string = "";
    CRTFA: string = "";
    RNWDT: string = "";
    RNWFA: string = "";
    HDNGD: string = "";
    HDNGR: string = "";
    HDNGVR: string = "";
    LCAID: string = "";
    TYPE: string = "";
    PLACE: string = "";
    YEAR: string = "";
    SF: NameSF[];
    SAF: NameSAF[];
    NOTE: NameNOTE[];
}

export class NameSF{
    SFD: string = "";
    SFR: string = "";
    SFVR: string = "";
}

export class NameSAF{
    SAFD: string = "";
    SAFR: string = "";
    SAFVR: string = "";
    SAFID: string = "";
}

export class NameNOTE{
    NOTE: string = "";
}

export class NameSummaryDisplay implements IDisplayLinesSummary{
    private fullRecordData: Name;
    private record: NameSummary;

    constructor(
        private translate: TranslateService,
        fullRecordData: Name){
            this.fullRecordData = fullRecordData;
            this.record = this.fullRecordData.getSummaryView();
    }

    getDisplayTitle(): string {
        let title = this.record.AUTH + "; " + this.record.DATE;
        return title;
    }

    initContentDisplay(): Array<string> {
        let summaryLines = new Array<string>();
        summaryLines.push( this.translate.instant("Catalog.Results.NACSISID") + ": " + this.record.ID);
        return summaryLines;
    }

    getFullRecordData() {
        return this.fullRecordData;
    }
}

export class NameFullDisplay extends IDisplayLinesFull {
    
    constructor(fullViewRecord: NameFull) {
            super(fullViewRecord);
        }

    initContentDisplay(){
        this.fullViewLines = new Array<FullViewLine>();
        let fieldArray = new Array<FullViewField>()
            fieldArray.push(new FieldBuilder().label("Create date: ").content(this.dateFormatDisplay(this.record.CRTDT)).build());
            fieldArray.push(new FieldBuilder().label("Creating institution: ").content(this.record.CRTFA).link('').build());
            fieldArray.push(new FieldBuilder().label("Update date: ").content(this.dateFormatDisplay(this.record.RNWDT)).build());
            fieldArray.push(new FieldBuilder().label("Modifying institution: ").content(this.record.RNWFA).link('').build());
        this.addLine(new FieldBuilder().build(), fieldArray);
        fieldArray = new Array<FullViewField>();
            fieldArray.push(new FieldBuilder().content(this.record.HDNGD).build());
            fieldArray.push(new FieldBuilder().label("|| ").content(this.record.HDNGR).build());
            fieldArray.push(new FieldBuilder().label("|| ").content(this.record.HDNGVR).build());
        this.addLine(new FieldBuilder().label("HDNG").build(), fieldArray);
        fieldArray = new Array<FullViewField>();
            fieldArray.push(new FieldBuilder().content(this.record.LCAID).build());
        this.addLine(new FieldBuilder().label("LCAID").build(), fieldArray);
        fieldArray = new Array<FullViewField>();
            fieldArray.push(new FieldBuilder().content(this.record.TYPE).build());
        this.addLine(new FieldBuilder().label("TYPE").build(), fieldArray);
        fieldArray = new Array<FullViewField>();
            fieldArray.push(new FieldBuilder().content(this.record.PLACE).build());
        this.addLine(new FieldBuilder().label("PLACE").build(), fieldArray);
        fieldArray = new Array<FullViewField>();
            fieldArray.push(new FieldBuilder().content(this.record.YEAR).build());
        this.addLine(new FieldBuilder().label("DATE").build(), fieldArray);
        this.record.SF?.forEach(sf=>{
            fieldArray = new Array<FullViewField>();
                fieldArray.push(new FieldBuilder().content(sf.SFD).build());
                fieldArray.push(new FieldBuilder().label("|| ").content(sf.SFR).build());
                fieldArray.push(new FieldBuilder().label("|| ").content(sf.SFVR).build());
            this.addLine(new FieldBuilder().label("SF").build(), fieldArray);
        });
        this.record.SAF?.forEach(saf=>{
            fieldArray = new Array<FullViewField>();
                fieldArray.push(new FieldBuilder().content(saf.SAFD).build());
                fieldArray.push(new FieldBuilder().label("|| ").content(saf.SAFR).build());
                fieldArray.push(new FieldBuilder().label("|| ").content(saf.SAFVR).build());
                fieldArray.push(new FieldBuilder().label("|| ").content(saf.SAFID).link('').build());
            this.addLine(new FieldBuilder().label("SAF").build(), fieldArray);
        });
        this.record.NOTE?.forEach(note=>{
            fieldArray = new Array<FullViewField>();
                fieldArray.push(new FieldBuilder().content(note.NOTE).build());
            this.addLine(new FieldBuilder().label("NOTE").build(), fieldArray);
        });

        return this.fullViewLines;
    }


}

