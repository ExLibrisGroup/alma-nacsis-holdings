import { TranslateService } from '@ngx-translate/core';
import { IDisplayLinesSummary, BaseResult, FullViewField, IDisplayLinesFull, FullViewLine, FieldBuilder } from './results-common';


export class Monograph extends BaseResult{
    summaryView: MonographSummary;
    fullView : MonographFull;
    
    constructor(record: any){
        super(record);
    }
}

export class MonographSummary{
    TITLE: string = "";
    AUTH: string = "";
    PUBL: string = "";
    LANG: string = "";
    YEAR: string = "";
    ID: string = "";
    ISBN: string = "";
    SH: string = "";
}

export class MonographFull{
    ID: string = "";
    CRTDT: string = "";
    CRTFA: string = "";
    RNWDT: string = "";
    RNWFA: string = "";
    ISSN: string = "";
    NBN: string = "";
    LCCN: string = "";
    NDLCN: string = "";
    REPRO: string = "";
    GPON: string = "";
    OTHN: string = "";
    GMD: string = "";
    SMD: string = "";
    YEAR: string = "";
    CNTRY: string = "";
    TTLL: string = "";
    TXTL: string = "";
    ORGL: string = "";
    VOLG: MonographVOLG[];
    TRD: string = "";
    TRR: string = "";
    TRVR: string = "";
    ED: string = "";
    PUB: MonographPUB[];
    PUBDT: string = "";
    PHYSP: string = "";
    PHYSI: string = "";
    PHYSS: string = "";
    PHYSA: string = "";
    VT: MonographVT[];
    CW: MonographCW[];
    NOTE: MonographNOTE[];
    PTBL: MonographPTBL[];
    AL: MonographAL[];
    UTL: MonographUTL[];
    CLS: MonographCLS[];
    SH: MonographSH[];
    IDENT: MonographIDENT[];
}

export class MonographVOLG{
    VOL: string = "";
    ISBN: string = "";
    PRICE: string = "";
    XISBN: string = "";
}

export class MonographPUB{
    PUBP: string = "";
    PUBL: string = "";
}

export class MonographVT{
    VTK: string = "";
    VTD: string = "";
    VTR: string = "";
    VTVR: string = "";
}

export class MonographCW{
    CWT: string = "";
    CWA: string = "";
    CWR: string = "";
    CWVR: string = "";
}

export class MonographNOTE{
    NOTE: string = "";
}

export class MonographPTBL{
    PTBTR: string = "";
    PTBTRR: string = "";
    PTBTRVR: string = "";
    PTBID: string = "";
    PTBNO: string = "";
    PTBK: string = "";
}

export class MonographAL{
    AFLG: string = "";
    AHDNG: string = "";
    AHDNGR: string = "";
    AHDNGVR: string = "";
    AID: string = "";
    AF: string = "";
}

export class MonographUTL{
    UTFLG: string = "";
    UTHDNG: string = "";
    UTHDNGR: string = "";
    UTHDNGVR: string = "";
    UTID: string = "";
    UTINFO: string = "";
}

export class MonographCLS{
    CLSK: string = "";
    CLSD: string = "";
}

export class MonographSH{
    SHT: string = "";
    SHD: string = "";
    SHR: string = "";
    SHVR: string = "";
    SHK: string = "";
}

export class MonographIDENT{
    IDENT: string = "";
}

export class MonographSummaryDisplay implements IDisplayLinesSummary{
    private fullRecordData: Monograph;
    private record: MonographSummary;

    constructor(
        private translate: TranslateService,
        fullRecordData: Monograph
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
        + ", " + this.record.LANG + ": " + this.record.YEAR + ")");
        summaryLines.push( this.translate.instant("Catalog.Results.NACSISID") + ": " + this.record.ID);
        summaryLines.push( this.translate.instant("Catalog.Results.ISBN") + ": " + this.record.ISBN);
        summaryLines.push( this.translate.instant("Catalog.Results.Subjects") + ": " + this.record.SH);
        
        return summaryLines;
    }

    getFullRecordData() {
        return this.fullRecordData;
    }
}

export class MonographFullDisplay extends IDisplayLinesFull {
    
    constructor(fullViewRecord: MonographFull) {
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
            fieldArray.push(new FieldBuilder().label("NBN: ").content(this.record.NBN).build());
            fieldArray.push(new FieldBuilder().label("LCCN: ").content(this.record.LCCN).build());
            fieldArray.push(new FieldBuilder().label("NDLCN: ").content(this.record.NDLCN).build());
            fieldArray.push(new FieldBuilder().label("REPRO: ").content(this.record.REPRO).build());
            fieldArray.push(new FieldBuilder().label("GPON: ").content(this.record.GPON).build());
            fieldArray.push(new FieldBuilder().label("OTHN: ").content(this.record.OTHN).build());
        this.addLine(new FieldBuilder().label("CODE").build(), fieldArray);
        fieldArray = new Array<FullViewField>();
            fieldArray.push(new FieldBuilder().label("GMD: ").content(this.record.GMD).build());
            fieldArray.push(new FieldBuilder().label("SMD: ").content(this.record.SMD).build());
            fieldArray.push(new FieldBuilder().label("YEAR: ").content(this.record.YEAR).build());
            fieldArray.push(new FieldBuilder().label("CNTRY: ").content(this.record.CNTRY).build());
            fieldArray.push(new FieldBuilder().label("TTLL: ").content(this.record.TTLL).build());
            fieldArray.push(new FieldBuilder().label("TXTL: ").content(this.record.TXTL).build());
            fieldArray.push(new FieldBuilder().label("ORGL: ").content(this.record.ORGL).build());
        this.addLine(new FieldBuilder().label("CODE").build(), fieldArray);
        this.record.VOLG?.forEach(vol=>{
            fieldArray = new Array<FullViewField>();
                fieldArray.push(new FieldBuilder().label("VOL: ").content(vol.VOL).build());
                fieldArray.push(new FieldBuilder().label("ISBN: ").content(vol.ISBN).build());
                fieldArray.push(new FieldBuilder().label("PRICE: ").content(vol.PRICE).build());
                fieldArray.push(new FieldBuilder().label("XISBN: ").content(vol.XISBN).build());
            this.addLine(new FieldBuilder().label("VOLG").build(), fieldArray);
        });
        fieldArray = new Array<FullViewField>();
            fieldArray.push(new FieldBuilder().content(this.record.TRD).build());
            fieldArray.push(new FieldBuilder().label("|| ").content(this.record.TRR).build());
            fieldArray.push(new FieldBuilder().label("|| ").content(this.record.TRVR).build());
        this.addLine(new FieldBuilder().label("TR").build(), fieldArray);
        fieldArray = new Array<FullViewField>();
            fieldArray.push(new FieldBuilder().content(this.record.ED).build());
        this.addLine(new FieldBuilder().label("ED").build(), fieldArray);
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
        this.record.CW?.forEach(cw=>{
            fieldArray = new Array<FullViewField>();
                fieldArray.push(new FieldBuilder().content(cw.CWT).build());
                fieldArray.push(new FieldBuilder().label("/ ").content(cw.CWA).build());
                fieldArray.push(new FieldBuilder().label("|| ").content(cw.CWR).build());
                fieldArray.push(new FieldBuilder().label("|| ").content(cw.CWVR).build());
            this.addLine(new FieldBuilder().label("CW").build(), fieldArray);
        });
        this.record.NOTE?.forEach(note=>{
            fieldArray = new Array<FullViewField>();
                fieldArray.push(new FieldBuilder().content(note.NOTE).build());
            this.addLine(new FieldBuilder().label("NOTE").build(), fieldArray);
        });
        this.record.PTBL?.forEach(ptbl=>{
            fieldArray = new Array<FullViewField>();
                fieldArray.push(new FieldBuilder().content(ptbl.PTBTR).build());
                fieldArray.push(new FieldBuilder().label("|| ").content(ptbl.PTBTRR).build());
                fieldArray.push(new FieldBuilder().label("|| ").content(ptbl.PTBTRVR).build());
                fieldArray.push(new FieldBuilder().content(ptbl.PTBID).link('').build());
                fieldArray.push(new FieldBuilder().content(ptbl.PTBNO).build());
                fieldArray.push(new FieldBuilder().label("// ").content(ptbl.PTBK).build());
            this.addLine(new FieldBuilder().label("PTBL").build(), fieldArray);
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
        this.record.UTL?.forEach(utl=>{
            fieldArray = new Array<FullViewField>();
                fieldArray.push(new FieldBuilder().content(utl.UTFLG).build());
                fieldArray.push(new FieldBuilder().content(utl.UTHDNG).build());
                fieldArray.push(new FieldBuilder().label("|| ").content(utl.UTHDNGR).build());
                fieldArray.push(new FieldBuilder().label("|| ").content(utl.UTHDNGVR).build());
                fieldArray.push(new FieldBuilder().content(utl.UTID).build());
                fieldArray.push(new FieldBuilder().content(utl.UTINFO).build());
            this.addLine(new FieldBuilder().label("UTL").build(), fieldArray);
        });
        this.record.CLS?.forEach(cls=>{
            fieldArray = new Array<FullViewField>();
                fieldArray.push(new FieldBuilder().content(cls.CLSK).build());
                fieldArray.push(new FieldBuilder().label(": ").content(cls.CLSD).build());
            this.addLine(new FieldBuilder().label("CLS").build(), fieldArray);
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

