import { TranslateService } from '@ngx-translate/core';
import { IDisplayLines, BaseResult, ViewField, ViewLine, ViewFieldBuilder, BLANK_SPACE } from './results-common';
import { SearchType } from '../../user-controls/search-form/search-form-utils';


export class Monograph extends BaseResult{
    summaryView: MonographSummary;
    fullView : MonographFull;
    
    constructor(record: any, translate: TranslateService){
        super(record, translate);
    }

    getSummaryDisplay() {
        return new MonographSummaryDisplay(this.translate, this);
    }

    getFullViewDisplay() {
        return new MonographFullDisplay(this);
    }
}

export class MonographSummary{
    TRD: string = "";
    AL: MonographAL[];
    PUB: MonographPUB[];
    TTLL: string = "";
    YEAR1: string = "";
    YEAR2: string = "";
    TRR: string = "";
    TRVR: string = "";
    ID: string = "";
    VOLG: MonographVOLG[];
    SH: MonographSH[];
    PTBL: MonographPTBL[];
    ED: string = "";
}

export class MonographFull{
    ID: string = "";
    CRTDT: string = "";
    CRTFA: string = "";
    RNWDT: string = "";
    RNWFA: string = "";
    ISSN: string = "";
    NBN: MonographNBN[];
    OTHN: MonographOTHN[];
    LCCN: string = "";
    NDLCN: string = "";
    REPRO: string = "";
    GPON: string = "";
    GMD: string = "";
    SMD: string = "";
    YEAR1: string = "";
    YEAR2: string = "";
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
    REM: string = "";
}

export class MonographVOLG{
    VOL: string = "";
    ISBN: string = "";
    PRICE: string = "";
    XISBN: MonographXISBN[];
}

export class MonographXISBN{
    XISBN: string = "";
}

export class MonographPUB{
    PUBP: string = "";
    PUBL: string = "";
    PUBDT: string = "";
    PUBF: string = "";
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

export class MonographOTHN{
    OTHN: string = "";
}
export class MonographNBN{
    NBN: string = "";
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

export class MonographSummaryDisplay extends IDisplayLines{
    private record: MonographSummary;

    constructor(
        private translate: TranslateService,
        fullRecordData: Monograph
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
            fieldsArray.push(new ViewFieldBuilder().label('Catalog.Results.Book').build());
            fieldsArray.push(new ViewFieldBuilder().content(this.record.PUB[0]?.PUBL).build());
            fieldsArray.push(new ViewFieldBuilder().label(", ").content(this.record.TTLL).build());
            //Do not display in case the YEAR ot the PUB DATE are empty or contain non numeric value.
            let date : string = this.getFirstPriorityDate();
            if(!this.isEmpty(date) && date.match(/^[0-9]+$/)) {
                fieldsArray.push(new ViewFieldBuilder().label(": ").content(date).build());           
                fieldsArray.push(new ViewFieldBuilder().label("- ").content(this.record.YEAR2).build());
            }
          
            fieldsArray.push(new ViewFieldBuilder().label("; ").content(this.record.VOLG[0]?.VOL).build());
            if(this.record.VOLG?.length > 1) {
                fieldsArray.push(new ViewFieldBuilder().label("- ").content(this.record.VOLG[this.record.VOLG.length-1]?.VOL).build());
            }
            fieldsArray.push(new ViewFieldBuilder().label(")").build());
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);
        // TR line
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.TRR).link('').build());  
            // fieldsArray.push(new ViewFieldBuilder().content(this.record.TRVR).link('').build());
            fieldsArray = this.setSeparator(fieldsArray, "||");
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);
        // ID line
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().label('Catalog.Results.NACSISID').content(this.record.ID).build());      
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);
        // ISBN line
        fieldsArray = new Array<ViewField>();
            let isbnStrField: string;
            if(!this.isEmpty(this.record.VOLG?.length)) {
                // Setting the main identifier (ISBN or XISBN)
                if(!this.isEmpty(this.record.VOLG[0]?.ISBN)) {
                    isbnStrField = this.record.VOLG[0]?.ISBN;
                } else if(!this.isEmpty(this.record.VOLG[0]?.XISBN)) {
                    isbnStrField = this.record.VOLG[0]?.XISBN[0].XISBN;
                }
                // Adding the "and others" label
                if(this.record.VOLG?.length > 1 || this.record.VOLG[0]?.XISBN?.length > 1 
                    || (!this.isEmpty(this.record.VOLG[0]?.ISBN) && !this.isEmpty(this.record.VOLG[0]?.XISBN[0]?.XISBN))) {
                        isbnStrField = isbnStrField + " "  + this.translate.instant('Catalog.Results.AndOthers');
                }
            }
            fieldsArray.push(new ViewFieldBuilder().label('Catalog.Results.ISBN').content(isbnStrField).build());      
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);
         // ED line
         fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().label('Catalog.Results.ED').content(this.record.ED).build());      
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);
        // PTBL line
        let ptblStrFields = "";
        for (let i = 0; i < this.record.PTBL?.length; i++) {
            ptblStrFields = ptblStrFields + this.record.PTBL[i]?.PTBTR;
            if(!this.isEmpty(this.record.PTBL[i]?.PTBNO)) {
                ptblStrFields = ptblStrFields +  "; " + this.record.PTBL[i]?.PTBNO;
            }
            if(i != this.record.PTBL?.length-1) {
                ptblStrFields = ptblStrFields + "<br/>";
            }
        }
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().label('Catalog.Results.PTBL').content(ptblStrFields).build());      
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

export class MonographFullDisplay extends IDisplayLines {
    private record: MonographFull;
    
    constructor(fullViewRecord: Monograph) {
            super(fullViewRecord);
            this.record = fullViewRecord.getFullView();
        }

    initContentDisplay(){
        this.viewLines = new Array<ViewLine>();
        let fieldsArray = new Array<ViewField>()
            fieldsArray.push(new ViewFieldBuilder().label("Create date: ").content(this.dateFormatDisplay(this.record.CRTDT)).build());
            fieldsArray.push(new ViewFieldBuilder().label("Creating institution: ").content(this.record.CRTFA).link(SearchType.Members).build()); 
            fieldsArray.push(new ViewFieldBuilder().label("Update date: ").content(this.dateFormatDisplay(this.record.RNWDT)).build());
            fieldsArray.push(new ViewFieldBuilder().label("Modifying institution: ").content(this.record.RNWFA).link(SearchType.Members).build());
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);
        fieldsArray = new Array<ViewField>()
            fieldsArray.push(new ViewFieldBuilder().content(this.record.ID).build());
        this.addLine(new ViewFieldBuilder().label("NACSIS ID").build(), fieldsArray);
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().label("ISSN: ").content(this.record.ISSN).build());
            fieldsArray.push(new ViewFieldBuilder().label("LCCN: ").content(this.record.LCCN).build());
            fieldsArray.push(new ViewFieldBuilder().label("NDLCN: ").content(this.record.NDLCN).build());
            fieldsArray.push(new ViewFieldBuilder().label("REPRO: ").content(this.record.REPRO).build());
            fieldsArray.push(new ViewFieldBuilder().label("GPON: ").content(this.record.GPON).build());
        this.addLine(new ViewFieldBuilder().label("CODE").build(), fieldsArray);
        fieldsArray = new Array<ViewField>();
        this.record.OTHN?.forEach(othn => {
            fieldsArray.push(new ViewFieldBuilder().label("OTHN: ").content(othn.OTHN).build());
        });
        this.record.NBN?.forEach(nbn => {
            fieldsArray.push(new ViewFieldBuilder().label("NBN: ").content(nbn.NBN).build());
        });
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
        this.addLine(new ViewFieldBuilder().label("CODE").build(), fieldsArray);
        this.record.VOLG?.forEach(vol=>{
            fieldsArray = new Array<ViewField>();
                fieldsArray.push(new ViewFieldBuilder().label("VOL: ").content(vol.VOL).build());
                fieldsArray.push(new ViewFieldBuilder().label("ISBN: ").content(vol.ISBN).build());
                fieldsArray.push(new ViewFieldBuilder().label("PRICE: ").content(vol.PRICE).build());
                vol.XISBN?.forEach(xisbn => {
                    fieldsArray.push(new ViewFieldBuilder().label("XISBN: ").content(xisbn.XISBN).build());
                });
            this.addLine(new ViewFieldBuilder().label("VOLG").build(), fieldsArray);
        });
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.TRD).build());
            fieldsArray.push(new ViewFieldBuilder().label("|| ").content(this.record.TRR).build());
            fieldsArray.push(new ViewFieldBuilder().label("|| ").content(this.record.TRVR).build());
        this.addLine(new ViewFieldBuilder().label("TR").build(), fieldsArray);
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.ED).build());
        this.addLine(new ViewFieldBuilder().label("ED").build(), fieldsArray);
        this.record.PUB?.forEach(pub=>{
            fieldsArray = new Array<ViewField>();
                fieldsArray.push(new ViewFieldBuilder().content(pub.PUBP).build());
                fieldsArray.push(new ViewFieldBuilder().label(": ").content(pub.PUBL).build());
                fieldsArray.push(new ViewFieldBuilder().label(", ").content(pub.PUBDT).build());
                if (pub.PUBF != null)
                    fieldsArray.push(new ViewFieldBuilder().label("# ").content(pub.PUBF).build());
            this.addLine(new ViewFieldBuilder().label("PUB").build(), fieldsArray);
        });
        fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.PHYSP).build());
            fieldsArray.push(new ViewFieldBuilder().label(": ").content(this.record.PHYSI).build());
            fieldsArray.push(new ViewFieldBuilder().label("; ").content(this.record.PHYSS).build());
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
        this.record.CW?.forEach(cw=>{
            fieldsArray = new Array<ViewField>();
                fieldsArray.push(new ViewFieldBuilder().content(cw.CWT).build());
                fieldsArray.push(new ViewFieldBuilder().label("/ ").content(cw.CWA).build());
                fieldsArray.push(new ViewFieldBuilder().label("|| ").content(cw.CWR).build());
                fieldsArray.push(new ViewFieldBuilder().label("|| ").content(cw.CWVR).build());
            this.addLine(new ViewFieldBuilder().label("CW").build(), fieldsArray);
        });
        this.record.NOTE?.forEach(note=>{
            fieldsArray = new Array<ViewField>();
                fieldsArray.push(new ViewFieldBuilder().content(note.NOTE).build());
            this.addLine(new ViewFieldBuilder().label("NOTE").build(), fieldsArray);
        });
        this.record.PTBL?.forEach(ptbl=>{
            fieldsArray = new Array<ViewField>();
                fieldsArray.push(new ViewFieldBuilder().content(ptbl.PTBTR).build());
                fieldsArray.push(new ViewFieldBuilder().content(ptbl.PTBTRR).build());
                fieldsArray.push(new ViewFieldBuilder().content(ptbl.PTBTRVR).build());
                fieldsArray = this.setSeparator(fieldsArray, "||");
                fieldsArray.push(new ViewFieldBuilder().content(ptbl.PTBID).link(SearchType.Monographs).build());
                fieldsArray.push(new ViewFieldBuilder().content(ptbl.PTBNO).build());
                fieldsArray.push(new ViewFieldBuilder().label("// ").content(ptbl.PTBK).build());
            this.addLine(new ViewFieldBuilder().label("PTBL").build(), fieldsArray);
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
        this.record.UTL?.forEach(utl=>{
            fieldsArray = new Array<ViewField>();
                fieldsArray.push(new ViewFieldBuilder().content(utl.UTFLG).build());
                fieldsArray.push(new ViewFieldBuilder().content(utl.UTHDNG).build());
                fieldsArray.push(new ViewFieldBuilder().content(utl.UTHDNGR).build());
                fieldsArray.push(new ViewFieldBuilder().content(utl.UTHDNGVR).build());
                if(utl.UTFLG !== "*" && (!this.isEmpty(utl.UTHDNGR) || !this.isEmpty(utl.UTHDNGVR))){
                    fieldsArray = this.setSeparator(fieldsArray, "||");
                }
                fieldsArray.push(new ViewFieldBuilder().content(utl.UTID).link(SearchType.Names).build());
                fieldsArray.push(new ViewFieldBuilder().content(utl.UTINFO).build());
            this.addLine(new ViewFieldBuilder().label("UTL").build(), fieldsArray);
        });
        this.record.CLS?.forEach(cls=>{
            fieldsArray = new Array<ViewField>();
                fieldsArray.push(new ViewFieldBuilder().content(cls.CLSK).build());
                fieldsArray.push(new ViewFieldBuilder().label(": ").content(cls.CLSD).build());
            this.addLine(new ViewFieldBuilder().label("CLS").build(), fieldsArray);
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
        fieldsArray = new Array<ViewField>()
            fieldsArray.push(new ViewFieldBuilder().content(this.record.REM).build());
        this.addLine(new ViewFieldBuilder().label("REM").build(), fieldsArray);

        return this.viewLines;
    }
    

}