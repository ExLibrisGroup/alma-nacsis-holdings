import { TranslateService } from '@ngx-translate/core';
import { IDisplayLines, BaseResult, ViewField, ViewLine, ViewFieldBuilder } from './results-common';
import { SearchType } from '../main/form-utils';


export class Name extends BaseResult {
    summaryView: NameSummary;
    fullView : NameFull;

    constructor(record: any, translate: TranslateService){
        super(record, translate);
    }

    getSummaryDisplay() {
        return new NameSummaryDisplay(this.translate, this);
    }

    getFullViewDisplay() {
        return new NameFullDisplay(this);
    }
}

export class NameSummary{
    HDNGD: string = "";
    HDNGR: string = "";
    HDNGVR: string = "";
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


export class NameSummaryDisplay extends IDisplayLines{
    private record: NameSummary;

    constructor(
        private translate: TranslateService,
        fullRecordData: Name
        ) {
            super(fullRecordData);
            this.record = fullRecordData.getSummaryView();
        }

    initTitleDisplay(): ViewLine {
        let fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.HDNGD).build());
            fieldsArray.push(new ViewFieldBuilder().label("|| ").content(this.record.HDNGR).build());
            fieldsArray.push(new ViewFieldBuilder().label("|| ").content(this.record.HDNGVR).build());
        this.titleLine = new ViewLine(new ViewFieldBuilder().build(), fieldsArray.filter(field => field.hasContent() === true));
        return this.titleLine;
    }

    initContentDisplay(): Array<ViewLine> {
        this.viewLines = new Array<ViewLine>();
        let fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().label('Catalog.Results.NACSISID').content(this.record.ID).build());      
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);
        
        return this.viewLines;
    }

}

export class NameFullDisplay extends IDisplayLines {
    private record: NameFull;
    
    constructor(fullViewRecord: Name) {
        super(fullViewRecord);
        this.record = fullViewRecord.getFullView();
    }

    initContentDisplay(){
        this.viewLines = new Array<ViewLine>();
        let fieldsArray = new Array<ViewField>()
            fieldsArray.push(new ViewFieldBuilder().label("Create date: ").content(this.dateFormatDisplay(this.record.CRTDT)).build());
            fieldsArray.push(new ViewFieldBuilder().label("Creating institution: ").content(this.record.CRTFA).link(SearchType.Member).build());
            fieldsArray.push(new ViewFieldBuilder().label("Update date: ").content(this.dateFormatDisplay(this.record.RNWDT)).build());
            fieldsArray.push(new ViewFieldBuilder().label("Modifying institution: ").content(this.record.RNWFA).link(SearchType.Member).build());
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.HDNGD).build());
            fieldsArray.push(new ViewFieldBuilder().label("|| ").content(this.record.HDNGR).build());
            fieldsArray.push(new ViewFieldBuilder().label("|| ").content(this.record.HDNGVR).build());
        this.addLine(new ViewFieldBuilder().label("HDNG").build(), fieldsArray);
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.LCAID).build());
        this.addLine(new ViewFieldBuilder().label("LCAID").build(), fieldsArray);
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.TYPE).build());
        this.addLine(new ViewFieldBuilder().label("TYPE").build(), fieldsArray);
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.PLACE).build());
        this.addLine(new ViewFieldBuilder().label("PLACE").build(), fieldsArray);
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.YEAR).build());
        this.addLine(new ViewFieldBuilder().label("DATE").build(), fieldsArray);
        this.record.SF?.forEach(sf=>{
            fieldsArray = new Array<ViewField>();
                fieldsArray.push(new ViewFieldBuilder().content(sf.SFD).build());
                fieldsArray.push(new ViewFieldBuilder().content(sf.SFR).build());
                fieldsArray.push(new ViewFieldBuilder().content(sf.SFVR).build());
                fieldsArray = this.setSeparator(fieldsArray, "||");
            this.addLine(new ViewFieldBuilder().label("SF").build(), fieldsArray);
        });
        this.record.SAF?.forEach(saf=>{
            fieldsArray = new Array<ViewField>();
                fieldsArray.push(new ViewFieldBuilder().content(saf.SAFD).build());
                fieldsArray.push(new ViewFieldBuilder().content(saf.SAFR).build());
                fieldsArray.push(new ViewFieldBuilder().content(saf.SAFVR).build());
                fieldsArray.push(new ViewFieldBuilder().content(saf.SAFID).link(SearchType.Names).build());
                fieldsArray = this.setSeparator(fieldsArray, "||");
            this.addLine(new ViewFieldBuilder().label("SAF").build(), fieldsArray);
        });
        this.record.NOTE?.forEach(note=>{
            fieldsArray = new Array<ViewField>();
                fieldsArray.push(new ViewFieldBuilder().content(note.NOTE).build());
            this.addLine(new ViewFieldBuilder().label("NOTE").build(), fieldsArray);
        });

        return this.viewLines;
    }


}

