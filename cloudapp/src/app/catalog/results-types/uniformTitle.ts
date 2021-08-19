import { TranslateService } from '@ngx-translate/core';
import { IDisplayLinesSummary, BaseResult, IDisplayLinesFull, FullViewField, FullViewLine, FieldBuilder } from './results-common';


export class UniformTitle extends BaseResult {
    summaryView: UniformTitleSummary;
    fullView : UniformTitleFull;

    constructor(record: any){
        super(record);
    }
}

export class UniformTitleSummary{
    TITLE: string = "";
    ID: string = "";
}

export class UniformTitleFull{
    ID: string = "";
    // empty header
    CRTDT: string = "";
    CRTFA: string = "";
    RNWDT: string = "";
    RNWFA: string = "";
    // HDNG
    HDNGD: string = "";
    HDNGR: string = "";
    HDNGVR: string = "";
    // LCUID
    LCUID: string = "";
    // SF
    SF: UniformTitleSF[];
    // SAF
    SAF: UniformTitleSAF[];
    // NOTE
    NOTE: UniformTitleNOTE[];
}

export class UniformTitleSF{
    SFD: string = "";
    SFR: string = "";
    SFVR: string = "";
}

export class UniformTitleSAF{
    SAFD: string = "";
    SAFR: string = "";
    SAFVR: string = "";
    SAFID: string = "";
}

export class UniformTitleNOTE{
    NOTE: string = "";
}

export class UniformTitleSummaryDisplay implements IDisplayLinesSummary{
    private fullRecordData: UniformTitle;
    private record: UniformTitleSummary;

    constructor(
        private translate: TranslateService,
        fullRecordData: UniformTitle){
            this.fullRecordData = fullRecordData;
            this.record = this.fullRecordData.getSummaryView();
    }

    getDisplayTitle(): string {
        return this.record.TITLE;
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

export class UniformTitleFullDisplay extends IDisplayLinesFull {
    
    constructor(fullViewRecord: UniformTitleFull) {
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
            fieldArray.push(new FieldBuilder().content(this.record.LCUID).build());
        this.addLine(new FieldBuilder().label("LCUID").build(), fieldArray);
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

