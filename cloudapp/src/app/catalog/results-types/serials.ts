import { TranslateService } from '@ngx-translate/core';
import { IDisplayLinesSummary, BaseResult, FullViewField, IDisplayLinesFull, FullViewLine, FieldBuilder } from './results-common';


export class Serial extends BaseResult{
    summaryView: SerialSummary;
    fullView : SerialFull;
    
    constructor(record: any){
        super(record);
    }
}

export class SerialSummary{
    TITLE: string = "";
    AUTH: string = "";
    PUBL: string = "";
    LANG: string = "";
    VOL: string = "";
    YEAR: string = "";
    ID: string = "";
    ISSN: string = "";
    SH: string = "";
}

export class SerialFull{
    ID: string = "";
    // empty header
    CRTDT: string = "";
    CRTFA: string = "";
    RNWDT: string = "";
    RNWFA: string = "";
    // CODE
    ISSN: string = "";
    XISSN: string = "";
    CODEN: string = "";
    LCCN: string = "";
    NDLPN: string = "";
    ULPN: string = "";
    GPON: string = "";
    GMD: string = "";
    SMD: string = "";
    YEAR: string = "";
    CNTRY: string = "";
    TTLL: string = "";
    TXTL: string = "";
    ORGL: string = "";
    REPRO: string = "";
    PSTAT: string = "";
    FREQ: string = "";
    REGL: string = "";
    TYPE: string = "";
    // TR
    TRD: string = "";
    TRR: string = "";
    TRVR: string = "";
    // ED
    ED: string = "";
    // VLYR
    VLYR: string = "";
    // PUB
    PUB: serialPUB[];
    // PHYS
    PHYSP: string = "";
    PHYSI: string = "";
    PHYSS: string = "";
    PHYSA: string = "";
    // VT
    VT: serialVT[];
    // NOTE
    NOTE: serialNOTE[];
    // PRICE
    PRICE: string = "";
    // FID
    FID: string = "";
    // BHNT
    BHNT: serialBHNT[];
    // AL
    AL: serialAL[];
    // SH
    SH: serialSH[];
    // IDENT
    IDENT: serialIDENT[];
}

export class serialPUB{
    PUBP: string = "";
    PUBL: string = "";
    PUBDT: string = "";
}

export class serialVT{
    VTK: string = "";
    VTD: string = "";
    VTR: string = "";
    VTVR: string = "";
}

export class serialNOTE{
    NOTE: string = "";
}

export class serialBHNT{
    BHK: string = "";
    BHTR: string = "";
    BHBID: string = "";
}

export class serialAL{
    AFLG: string = "";
    AHDNG: string = "";
    AHDNGR: string = "";
    AHDNGVR: string = "";
    AID: string = "";
    AF: string = "";
}

export class serialSH{
    SHT: string = "";
    SHD: string = "";
    SHR: string = "";
    SHVR: string = "";
    SHK: string = "";
}

export class serialIDENT{
    IDENT: string = "";
}


export class SerialSummaryDisplay implements IDisplayLinesSummary{
    private fullRecordData: Serial;
    private record: SerialSummary;

    constructor(
        private translate: TranslateService,
        fullRecordData: Serial
        ) {
            this.fullRecordData = fullRecordData;
            this.record = this.fullRecordData.getSummaryView();
        }

    getDisplayTitle(): string {
        return this.record.TITLE;
    }

    initContentDisplay(): Array<string> {
        let summaryLines = new Array<string>();

        summaryLines.push(this.translate.instant('Catalog.Results.By') + " " + this.record.AUTH + " ("
        + this.translate.instant("Catalog.Results.Book") + " " + this.record.PUBL
        + ", " + this.record.LANG + ": " + this.record.VOL + "; " + this.record.YEAR + ")");
        summaryLines.push( this.translate.instant("Catalog.Results.NACSISID") + ": " + this.record.ID);
        summaryLines.push( this.translate.instant("Catalog.Results.ISSN") + ": " + this.record.ISSN);
        summaryLines.push( this.translate.instant("Catalog.Results.Subjects") + ": " + this.record.SH);
        
        return summaryLines;
    }

    getFullRecordData() {
        return this.fullRecordData;
    }
}

export class SerialFullDisplay extends IDisplayLinesFull {
    
    constructor(
        fullViewRecord: SerialFull
    ) {
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
            fieldArray.push(new FieldBuilder().label("ISSN: ").content(this.record.ISSN).build());
            fieldArray.push(new FieldBuilder().label("XISSN: ").content(this.record.XISSN).build());
            fieldArray.push(new FieldBuilder().label("CODEN: ").content(this.record.CODEN).build());
            fieldArray.push(new FieldBuilder().label("LCCN: ").content(this.record.LCCN).build());
            fieldArray.push(new FieldBuilder().label("NDLPN: ").content(this.record.NDLPN).build());
            fieldArray.push(new FieldBuilder().label("ULPN: ").content(this.record.ULPN).build());
            fieldArray.push(new FieldBuilder().label("GPON: ").content(this.record.GPON).build());
        this.addLine(new FieldBuilder().label("CODE").build(), fieldArray);
        fieldArray = new Array<FullViewField>();
            fieldArray.push(new FieldBuilder().label("GMD: ").content(this.record.GMD).build());
            fieldArray.push(new FieldBuilder().label("SMD: ").content(this.record.SMD).build());
            fieldArray.push(new FieldBuilder().label("YEAR: ").content(this.record.YEAR).build());
            fieldArray.push(new FieldBuilder().label("CNTRY: ").content(this.record.CNTRY).build());
            fieldArray.push(new FieldBuilder().label("TTLL: ").content(this.record.TTLL).build());
            fieldArray.push(new FieldBuilder().label("TXTL: ").content(this.record.TXTL).build());
            fieldArray.push(new FieldBuilder().label("ORGL: ").content(this.record.ORGL).build());
            fieldArray.push(new FieldBuilder().label("REPRO: ").content(this.record.REPRO).build());
            fieldArray.push(new FieldBuilder().label("PSTAT: ").content(this.record.PSTAT).build());
            fieldArray.push(new FieldBuilder().label("FREQ: ").content(this.record.FREQ).build());
            fieldArray.push(new FieldBuilder().label("REGL: ").content(this.record.REGL).build());
            fieldArray.push(new FieldBuilder().label("TYPE: ").content(this.record.TYPE).build());
        this.addLine(new FieldBuilder().label("CODE").build(), fieldArray);
        fieldArray = new Array<FullViewField>();
            fieldArray.push(new FieldBuilder().content(this.record.TRD).build());
            fieldArray.push(new FieldBuilder().label("|| ").content(this.record.TRR).build());
            fieldArray.push(new FieldBuilder().label("|| ").content(this.record.TRVR).build());
        this.addLine(new FieldBuilder().label("TR").build(), fieldArray);
        fieldArray = new Array<FullViewField>();
            fieldArray.push(new FieldBuilder().content(this.record.ED).build());
        this.addLine(new FieldBuilder().label("ED").build(), fieldArray);
        fieldArray = new Array<FullViewField>();
            fieldArray.push(new FieldBuilder().content(this.record.VLYR).build());
        this.addLine(new FieldBuilder().label("VLYR").build(), fieldArray);
        this.record.PUB?.forEach(pub=>{
            fieldArray = new Array<FullViewField>();
                fieldArray.push(new FieldBuilder().content(pub.PUBP).build());
                fieldArray.push(new FieldBuilder().label(": ").content(pub.PUBL).build());
                fieldArray.push(new FieldBuilder().label(", ").content(pub.PUBDT).build());
            this.addLine(new FieldBuilder().label("PUB").build(), fieldArray);
        });
        fieldArray = new Array<FullViewField>();
            fieldArray.push(new FieldBuilder().content(this.record.PHYSP).build());
            fieldArray.push(new FieldBuilder().label("; ").content(this.record.PHYSI).build());
            fieldArray.push(new FieldBuilder().label("; ").content(this.record.PHYSS).build());
            fieldArray.push(new FieldBuilder().label("+").content(this.record.PHYSA).build());
        this.addLine(new FieldBuilder().label("PHYS").build(), fieldArray);
        this.record.VT?.forEach(vt=>{
            fieldArray = new Array<FullViewField>();
                fieldArray.push(new FieldBuilder().content(vt.VTK).build());
                fieldArray.push(new FieldBuilder().label(": ").content(vt.VTD).build());
                fieldArray.push(new FieldBuilder().label("|| ").content(vt.VTR).build());
                fieldArray.push(new FieldBuilder().label("|| ").content(vt.VTVR).build());
            this.addLine(new FieldBuilder().label("VT").build(), fieldArray);
        });
        this.record.NOTE?.forEach(note=>{
            fieldArray = new Array<FullViewField>();
                fieldArray.push(new FieldBuilder().content(note.NOTE).build());
            this.addLine(new FieldBuilder().label("NOTE").build(), fieldArray);
        });
        fieldArray = new Array<FullViewField>();
            fieldArray.push(new FieldBuilder().content(this.record.PRICE).build());
        this.addLine(new FieldBuilder().label("PRICE").build(), fieldArray);
        fieldArray = new Array<FullViewField>();
            fieldArray.push(new FieldBuilder().content(this.record.FID).link('').build());
        this.addLine(new FieldBuilder().label("FID").build(), fieldArray);
        this.record.BHNT?.forEach(bhnt=>{
            fieldArray = new Array<FullViewField>();
                fieldArray.push(new FieldBuilder().content(bhnt.BHK).build());
                fieldArray.push(new FieldBuilder().label(": ").content(bhnt.BHTR).build());
                fieldArray.push(new FieldBuilder().content(bhnt.BHBID).link('').build());
            this.addLine(new FieldBuilder().label("BHNT").build(), fieldArray);
        });
        this.record.AL?.forEach(al=>{
            fieldArray = new Array<FullViewField>();
                fieldArray.push(new FieldBuilder().content(al.AFLG).build());
                fieldArray.push(new FieldBuilder().content(al.AHDNG).build());
                fieldArray.push(new FieldBuilder().label("|| ").content(al.AHDNGR).build());
                fieldArray.push(new FieldBuilder().label("|| ").content(al.AHDNGVR).build());
                fieldArray.push(new FieldBuilder().content(al.AID).link('').build());
                fieldArray.push(new FieldBuilder().content(al.AF).build());
            this.addLine(new FieldBuilder().label("AL").build(), fieldArray);
        });
        this.record.SH?.forEach(sh=>{
            fieldArray = new Array<FullViewField>();
                fieldArray.push(new FieldBuilder().content(sh.SHT).build());
                fieldArray.push(new FieldBuilder().label(": ").content(sh.SHD).build());
                fieldArray.push(new FieldBuilder().label("|| ").content(sh.SHR).build());
                fieldArray.push(new FieldBuilder().label("|| ").content(sh.SHVR).build());
                fieldArray.push(new FieldBuilder().label("// ").content(sh.SHK).build());
            this.addLine(new FieldBuilder().label("SH").build(), fieldArray);
        });
        this.record.IDENT?.forEach(ident=>{
            fieldArray = new Array<FullViewField>();
                fieldArray.push(new FieldBuilder().content(ident.IDENT).build());
            this.addLine(new FieldBuilder().label("IDENT").build(), fieldArray);
        });
        return this.fullViewLines;
    }

}

