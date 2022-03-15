import { TranslateService } from '@ngx-translate/core';
import { IDisplayLines, BaseResult, ViewField, ViewLine, ViewFieldBuilder } from './results-common';
import { SearchType } from '../../user-controls/search-form/search-form-utils';


export class Serial extends BaseResult{
    summaryView: SerialSummary;
    fullView : SerialFull;
    
    constructor(record: any, translate: TranslateService){
        super(record, translate);
    }

    getSummaryDisplay() {
        return new SerialSummaryDisplay(this.translate, this);
    }

    getFullViewDisplay() {
        return new SerialFullDisplay(this);
    }
}

export class SerialSummary{
    TRD: string = "";
    AL: SerialAL[];
    PUB: SerialPUB[];
    VLYR: string = "";
    TTLL: string = "";
    YEAR1: string = "";
    YEAR2: string = "";
    TRR: string = "";
    TRVR: string = "";
    ID: string = "";
    ISSN: string = "";
    SH: SerialSH[];
    ED: string = "";
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
    YEAR1: string = "";
    YEAR2: string = "";
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
    PUB: SerialPUB[];
    // PHYS
    PHYSP: string = "";
    PHYSI: string = "";
    PHYSS: string = "";
    PHYSA: string = "";
    // VT
    VT: SerialVT[];
    // NOTE
    NOTE: SerialNOTE[];
    // PRICE
    PRICE: string = "";
    // FID
    FID: string = "";
    // BHNT
    BHNT: SerialBHNT[];
    // AL
    AL: SerialAL[];
    // SH
    SH: SerialSH[];
    // IDENT
    IDENT: SerialIDENT[];
}

export class SerialPUB{
    PUBP: string = "";
    PUBL: string = "";
    PUBDT: string = "";
    PUBF: string = "";
}

export class SerialVT{
    VTK: string = "";
    VTD: string = "";
    VTR: string = "";
    VTVR: string = "";
}

export class SerialNOTE{
    NOTE: string = "";
}

export class SerialBHNT{
    BHK: string = "";
    BHTR: string = "";
    BHBID: string = "";
}

export class SerialAL{
    AFLG: string = "";
    AHDNG: string = "";
    AHDNGR: string = "";
    AHDNGVR: string = "";
    AID: string = "";
    AF: string = "";
}

export class SerialSH{
    SHT: string = "";
    SHD: string = "";
    SHR: string = "";
    SHVR: string = "";
    SHK: string = "";
}

export class SerialIDENT{
    IDENT: string = "";
}


export class SerialSummaryDisplay extends IDisplayLines{
    private record: SerialSummary;

    constructor(
        private translate: TranslateService,
        fullRecordData: Serial
        ) {
            super(fullRecordData);
            this.record = fullRecordData.getSummaryView();
        }

    initTitleDisplay(): ViewLine {
        let fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.TRD).build());
        this.titleLine = new ViewLine(new ViewFieldBuilder().build(), fieldsArray);
        return this.titleLine;
    }

    initContentDisplay(): Array<ViewLine> {
        this.viewLines = new Array<ViewLine>();
        // General information line
        let fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().label('Catalog.Results.By').content(this.record.AL[0]?.AHDNG).build());
            fieldsArray.push(new ViewFieldBuilder().label("|| ").content(this.record.AL[0]?.AHDNGR).build());
            fieldsArray.push(new ViewFieldBuilder().label("|| ").content(this.record.AL[0]?.AHDNGVR).build());
            fieldsArray.push(new ViewFieldBuilder().label('Catalog.Results.Journal').build());
            fieldsArray.push(new ViewFieldBuilder().content(this.record.PUB[0]?.PUBL).build());
            fieldsArray.push(new ViewFieldBuilder().label(", ").content(this.record.TTLL).build());
            fieldsArray.push(new ViewFieldBuilder().label(": ").content(this.record.VLYR).build());
            fieldsArray.push(new ViewFieldBuilder().label(")").build());
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);
        // TR line
        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.TRR).link('').build());  
        fieldsArray.push(new ViewFieldBuilder().content(this.record.TRVR).link('').build());
        fieldsArray = this.setSeparator(fieldsArray, "||");
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);
        // ID line
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().label('Catalog.Results.NACSISID').content(this.record.ID).build());      
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);
        // ISSN line
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().label('Catalog.Results.ISSN').content(this.record.ISSN).build());         
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);
        // ED line
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().label('Catalog.Results.ED').content(this.record.ED).build());      
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);
        // SH lines
        let shStrFields = "";
        let numOfIterations: number = Math.min(this.record.SH?.length, 3);
        for (let i = 0; i < numOfIterations; i++) {
            shStrFields = shStrFields + this.toStringPairOfFields(this.record.SH[i].SHD, this.record.SH[i].SHR, "||");
            if(i != numOfIterations-1) {
                shStrFields = shStrFields + "<br/>";
            }
        }
        if(this.record.SH?.length > 3) {
            shStrFields = shStrFields + " " + this.translate.instant('Catalog.Results.AndOthers');
        }
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().label('Catalog.Results.SH').content(shStrFields).build());      
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);

        return this.viewLines;
    }

}



export class SerialFullDisplay extends IDisplayLines {
    private record: SerialFull;
    
    constructor(fullViewRecord: Serial) {
        super(fullViewRecord);
        this.record = fullViewRecord.getFullView();
    }

    initContentDisplay(){
        this.viewLines = new Array<ViewLine>();
        let fieldsArray = new Array<ViewField>()
            fieldsArray.push(new ViewFieldBuilder().label("Create date: ").content(this.dateFormatDisplay(this.record.CRTDT)).build());
            fieldsArray.push(new ViewFieldBuilder().label("Creating institution: ").content(this.record.CRTFA).build());
            fieldsArray.push(new ViewFieldBuilder().label("Update date: ").content(this.dateFormatDisplay(this.record.RNWDT)).build());
            fieldsArray.push(new ViewFieldBuilder().label("Modifying institution: ").content(this.record.RNWFA).build());
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);
        fieldsArray = new Array<ViewField>()
            fieldsArray.push(new ViewFieldBuilder().content(this.record.ID).build());
        this.addLine(new ViewFieldBuilder().label("ID").build(), fieldsArray);
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().label("ISSN: ").content(this.record.ISSN).build());
            fieldsArray.push(new ViewFieldBuilder().label("XISSN: ").content(this.record.XISSN).build());
            fieldsArray.push(new ViewFieldBuilder().label("CODEN: ").content(this.record.CODEN).build());
            fieldsArray.push(new ViewFieldBuilder().label("LCCN: ").content(this.record.LCCN).build());
            fieldsArray.push(new ViewFieldBuilder().label("NDLPN: ").content(this.record.NDLPN).build());
            fieldsArray.push(new ViewFieldBuilder().label("ULPN: ").content(this.record.ULPN).build());
            fieldsArray.push(new ViewFieldBuilder().label("GPON: ").content(this.record.GPON).build());
        this.addLine(new ViewFieldBuilder().label("CODE").build(), fieldsArray);
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().label("GMD: ").content(this.record.GMD).build());
            fieldsArray.push(new ViewFieldBuilder().label("SMD: ").content(this.record.SMD).build());
            fieldsArray.push(new ViewFieldBuilder().label("YEAR: ").content(this.record.YEAR1).build());
            fieldsArray.push(new ViewFieldBuilder().label("- ").content(this.record.YEAR2).build());
            fieldsArray.push(new ViewFieldBuilder().label("CNTRY: ").content(this.record.CNTRY).build());
            fieldsArray.push(new ViewFieldBuilder().label("TTLL: ").content(this.record.TTLL).build());
            fieldsArray.push(new ViewFieldBuilder().label("TXTL: ").content(this.record.TXTL).build());
            fieldsArray.push(new ViewFieldBuilder().label("ORGL: ").content(this.record.ORGL).build());
            fieldsArray.push(new ViewFieldBuilder().label("REPRO: ").content(this.record.REPRO).build());
            fieldsArray.push(new ViewFieldBuilder().label("PSTAT: ").content(this.record.PSTAT).build());
            fieldsArray.push(new ViewFieldBuilder().label("FREQ: ").content(this.record.FREQ).build());
            fieldsArray.push(new ViewFieldBuilder().label("REGL: ").content(this.record.REGL).build());
            fieldsArray.push(new ViewFieldBuilder().label("TYPE: ").content(this.record.TYPE).build());
        this.addLine(new ViewFieldBuilder().label("CODE").build(), fieldsArray);
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.TRD).build());
            fieldsArray.push(new ViewFieldBuilder().label("|| ").content(this.record.TRR).build());
            fieldsArray.push(new ViewFieldBuilder().label("|| ").content(this.record.TRVR).build());
        this.addLine(new ViewFieldBuilder().label("TR").build(), fieldsArray);
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.ED).build());
        this.addLine(new ViewFieldBuilder().label("ED").build(), fieldsArray);
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.VLYR).build());
        this.addLine(new ViewFieldBuilder().label("VLYR").build(), fieldsArray);
        this.record.PUB?.forEach(pub=>{
            fieldsArray = new Array<ViewField>();
                if (pub.PUBF == "m") {
                    fieldsArray.push(new ViewFieldBuilder().label("(").build());
                }
                fieldsArray.push(new ViewFieldBuilder().content(pub.PUBP).build());
                fieldsArray.push(new ViewFieldBuilder().label(": ").content(pub.PUBL).build());
                fieldsArray.push(new ViewFieldBuilder().label(", ").content(pub.PUBDT).build());
                if (pub.PUBF == "m") {
                    fieldsArray.push(new ViewFieldBuilder().label(")").build());
                }
            this.addLine(new ViewFieldBuilder().label("PUB").build(), fieldsArray);
        });
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.PHYSP).build());
            fieldsArray.push(new ViewFieldBuilder().content(this.record.PHYSI).build());
            fieldsArray.push(new ViewFieldBuilder().content(this.record.PHYSS).build());
            fieldsArray = this.setSeparator(fieldsArray, ";");
            fieldsArray.push(new ViewFieldBuilder().label("+").content(this.record.PHYSA).build());
        this.addLine(new ViewFieldBuilder().label("PHYS").build(), fieldsArray);
        this.record.VT?.forEach(vt=>{
            fieldsArray = new Array<ViewField>();
                fieldsArray.push(new ViewFieldBuilder().content(vt.VTK).build());
                fieldsArray.push(new ViewFieldBuilder().label(": ").content(vt.VTD).build());
                fieldsArray.push(new ViewFieldBuilder().label("|| ").content(vt.VTR).build());
                fieldsArray.push(new ViewFieldBuilder().label("|| ").content(vt.VTVR).build());
            this.addLine(new ViewFieldBuilder().label("VT").build(), fieldsArray);
        });
        this.record.NOTE?.forEach(note=>{
            fieldsArray = new Array<ViewField>();
                fieldsArray.push(new ViewFieldBuilder().content(note.NOTE).build());
            this.addLine(new ViewFieldBuilder().label("NOTE").build(), fieldsArray);
        });
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.PRICE).build());
        this.addLine(new ViewFieldBuilder().label("PRICE").build(), fieldsArray);
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.FID).build());
        this.addLine(new ViewFieldBuilder().label("FID").build(), fieldsArray);
        this.record.BHNT?.forEach(bhnt=>{
            fieldsArray = new Array<ViewField>();
                fieldsArray.push(new ViewFieldBuilder().content(bhnt.BHK).build());
                fieldsArray.push(new ViewFieldBuilder().label(": ").content(bhnt.BHTR).build());
                fieldsArray.push(new ViewFieldBuilder().content(bhnt.BHBID).link(SearchType.Serials).build());
            this.addLine(new ViewFieldBuilder().label("BHNT").build(), fieldsArray);
        });
        this.record.AL?.forEach(al=>{
            fieldsArray = new Array<ViewField>();
                fieldsArray.push(new ViewFieldBuilder().content(al.AFLG).build());
                fieldsArray.push(new ViewFieldBuilder().content(al.AHDNG).build());
                fieldsArray.push(new ViewFieldBuilder().label("|| ").content(al.AHDNGR).build());
                fieldsArray.push(new ViewFieldBuilder().label("|| ").content(al.AHDNGVR).build());
                fieldsArray.push(new ViewFieldBuilder().content(al.AID).link(SearchType.Names).build());
                fieldsArray.push(new ViewFieldBuilder().content(al.AF).build());
            this.addLine(new ViewFieldBuilder().label("AL").build(), fieldsArray);
        });
        this.record.SH?.forEach(sh=>{
            fieldsArray = new Array<ViewField>();
                fieldsArray.push(new ViewFieldBuilder().content(sh.SHT).build());
                fieldsArray.push(new ViewFieldBuilder().label(": ").content(sh.SHD).build());
                fieldsArray.push(new ViewFieldBuilder().label("|| ").content(sh.SHR).build());
                fieldsArray.push(new ViewFieldBuilder().label("|| ").content(sh.SHVR).build());
                fieldsArray.push(new ViewFieldBuilder().label("// ").content(sh.SHK).build());
            this.addLine(new ViewFieldBuilder().label("SH").build(), fieldsArray);
        });
        this.record.IDENT?.forEach(ident=>{
            fieldsArray = new Array<ViewField>();
                fieldsArray.push(new ViewFieldBuilder().content(ident.IDENT).build());
            this.addLine(new ViewFieldBuilder().label("IDENT").build(), fieldsArray);
        });
        return this.viewLines;
    }

}

