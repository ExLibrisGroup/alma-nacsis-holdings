import { TranslateService } from '@ngx-translate/core';
import { IDisplayLines, BaseResult, ViewField, ViewLine, ViewFieldBuilder, BLANK_SPACE } from './results-common';
import { AlmaApiService } from '../../service/alma.api.service';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib/angular/ui/components/alerts/alert.service';

export class Member extends BaseResult {
    summaryView: MemberSummary;
    fullView: MemberFull;

    constructor(record: any, translate: TranslateService) {
        super(record, translate);
        /*
        The JSON file of members doesn't contain the summaryView and the fullView
        so after the super is called the summaryView and fullView are still empty
        and we need to populate them
        */
        this.summaryView = record;
        this.fullView = record;

    }

    getSummaryDisplay() {
        return new MemberSummaryDisplay(this.translate, this);
    }

    getFullViewDisplay() {
        return new MemberFullDisplay(this);
    }

}


export class MemberSummaryDisplay extends IDisplayLines {

    private record: MemberSummary;
    private alert: AlertService;

    constructor(
        private translate: TranslateService,
        fullRecordData: Member,
    ) {
        super(fullRecordData);
        this.record = fullRecordData.getSummaryView();
    }

    initTitleDisplay(): ViewLine {
        let fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.ID).build());
        this.titleLine = new ViewLine(new ViewFieldBuilder().build(), fieldsArray);
        return this.titleLine;
    }

    initContentDisplay(): Array<ViewLine> {

        this.viewLines = new Array<ViewLine>();
        let fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.NAME).build());      
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);

        return this.viewLines;
    }
}

export class MemberFullDisplay extends IDisplayLines {
    private record: MemberFull;
    constructor(fullViewRecord: Member) {
        super(fullViewRecord);
        this.record = fullViewRecord.getFullView();
    }
    initContentDisplay() {
        this.viewLines = new Array<ViewLine>();
        let fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().label("Member ID").content(this.record.ID).build());
        fieldsArray.push(new ViewFieldBuilder().label("Create date:").content(this.dateFormatDisplay(this.record.CRTDT)).build());
        fieldsArray.push(new ViewFieldBuilder().label("Update date:").content(this.dateFormatDisplay(this.record.RNWDT)).build());
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.NAME).build());
        fieldsArray.push(new ViewFieldBuilder().label("|| ").content(this.record.NAMER).build());
        this.addLine(new ViewFieldBuilder().label("Participating organization name").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.RYAKU).build());
        fieldsArray.push(new ViewFieldBuilder().label("|| ").content(this.record.RYAKUR).build());
        this.addLine(new ViewFieldBuilder().label("Participating organization abbreviation").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().label("Postal Code:").content(this.record.ZIP).build());
        fieldsArray.push(new ViewFieldBuilder().label("Street Address").content(this.record.ADDRESS).build());
        this.addLine(new ViewFieldBuilder().label("Address").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.ILLDEPT).build());
        this.addLine(new ViewFieldBuilder().label("ILL department").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.ILLSTAFF).build());
        this.addLine(new ViewFieldBuilder().label("ILL person in charge").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.TEL).build());
        this.addLine(new ViewFieldBuilder().label("Phone Number").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.FAX).build());
        this.addLine(new ViewFieldBuilder().label("Fax").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.SETCODE).build());
        this.addLine(new ViewFieldBuilder().label("Establisher Type").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.ORGCODE).build());
        this.addLine(new ViewFieldBuilder().label("Institution Type").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.CATFLG).build());
        this.addLine(new ViewFieldBuilder().label("CAT Participation Type").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.ILLFLG).build());
        this.addLine(new ViewFieldBuilder().label("ILL Participation Type").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.COPYS).build());
        this.addLine(new ViewFieldBuilder().label("Copy Service Type").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.LOANS).build());
        this.addLine(new ViewFieldBuilder().label("Lending Service Type").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.FAXS).build());
        this.addLine(new ViewFieldBuilder().label("FAX Service Type").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.STAT).build());
        this.addLine(new ViewFieldBuilder().label("Service Status").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.COPYAL).build());
        this.addLine(new ViewFieldBuilder().label("Copy reception hall code").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.LOANAL).build());
        this.addLine(new ViewFieldBuilder().label("Rental and borrowing center code").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.LOANP).build());
        this.addLine(new ViewFieldBuilder().label("LendingPeriod").build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.KENCODE).build());
        this.addLine(new ViewFieldBuilder().label("Region (prefecture) code").build(), fieldsArray);

        for (let i = 0; i < this.record.CATDEPT?.length; i++) {
            fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.CATDEPT[i]).build());
            if (!this.isEmpty(this.record.CATTEL) && this.record.CATTEL.length >= i) {
                if(i==1){
                    fieldsArray.push(new ViewFieldBuilder().label("Phone num. (Ext.)").content(this.record.CATTEL[i]).build());
                }else{
                    fieldsArray.push(new ViewFieldBuilder().label("Phone num.:").content(this.record.CATTEL[i]).build());
                }
            }
            if (!this.isEmpty(this.record.CATFAX) && this.record.CATFAX.length >= i) {
                fieldsArray.push(new ViewFieldBuilder().label("Fax").content(this.record.CATFAX[i]).build());
            }
            this.addLine(new ViewFieldBuilder().label("Cataloging department").build(), fieldsArray);
        }

        for (let i = 0; i < this.record.SYSDEPT?.length; i++) {
            fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.SYSDEPT[i]).build());
            if (!this.isEmpty(this.record.SYSTEL) && this.record.SYSTEL.length >= i) {
                fieldsArray.push(new ViewFieldBuilder().label("Phone num.").content(this.record.SYSTEL[i]).build());
            }
            if (!this.isEmpty(this.record.SYSFAX) && this.record.SYSFAX.length >= i) {
                fieldsArray.push(new ViewFieldBuilder().label("Fax").content(this.record.SYSFAX[i]).build());
            }
            this.addLine(new ViewFieldBuilder().label("System department").build(), fieldsArray);
        }
  
        for (let i = 0; i < this.record.EMAIL?.length; i++) {
            fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.EMAIL[i]).build());
            this.addLine(new ViewFieldBuilder().label("Email").build(), fieldsArray);
        }

        for (let i = 0; i < this.record.POLICY?.length; i++) {
            fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.POLICY[i]).build());
            this.addLine(new ViewFieldBuilder().label("ILL policy").build(), fieldsArray);
        }

        for (let i = 0; i < this.record.LOC?.length; i++) {
            fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.LOC[i]).build());
            this.addLine(new ViewFieldBuilder().label("Location code").build(), fieldsArray);
        }

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.GRPCODE).build());
        this.addLine(new ViewFieldBuilder().label("Offset code").build(), fieldsArray);

        return this.viewLines;
    }
}



export class MemberSummary {
    ID: string;
    NAME: string;
}


export class MemberFull {
    SYSTEL: any[];
    POLICY: any[];
    CATDEPT: any[];
    CATTEL: any[];

    ID: string;
    NAME: string;
    CRTDT: string;
    NAMER: string;
    RYAKU: string;

    RNWDT: string;
    RYAKUR: string;
    ILLDEPT: string;
    ADDRESS: string;
    COPYS: string;

    ILLSTAFF: string;
    ZIP: string;
    SETCODE: string;
    ORGCODE: string;
    TEL: string;
    EXTEL : string;//new

    FAX: string;
    CATFLG: string;
    ILLFLG: string;

    CATFAX: any[];
    EMAIL: any[];
    LOANP: string;
    LOANS: string;
    COPYAL: string;

    SYSFAX: any[];
    STAT: string;
    LOC: any[];
    GRPCODE: string;
    KENCODE: string;

    FAXS: string;
    LOANAL: string;
    SYSDEPT: any[];

}

export class MemberUpdate {
    ID: string;
    COPYS:any[];
    LOANS: string[];
    FAXS: string;
    STAT: string;
    ZIP: string;
    ADDRESS: string;
    TEL: string;
    EXTEL : string;
    FAX: string;
    ILLDEPT: string;
    ILLSTAFF: string;
    POLICY: any[];
    LOANP: string;
    CATDEPT: any[];
    CATTEL: any[];
    CATFAX: any[];
    SYSDEPT: any[];
    SYSTEL: any[];
    SYSFAX: any[];
    EMAIL: any[];
}
