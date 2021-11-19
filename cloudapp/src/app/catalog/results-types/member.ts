import { TranslateService } from '@ngx-translate/core';
import { IDisplayLines, BaseResult, ViewField, ViewLine, ViewFieldBuilder, BLANK_SPACE } from './results-common';
import { SearchType } from '../../user-controls/search-form/search-form-utils';

export class Member extends BaseResult{
    summaryView: MemberSummary;
    fullView : MemberFull;
    
    constructor(record: any, translate: TranslateService){
        super(record, translate);
    }

    getSummaryDisplay() {
        return new MemberSummaryDisplay(this.translate, this);
    }

    getFullViewDisplay() {
        return new MemberFullDisplay(this);
    }
}


export class MemberSummaryDisplay extends IDisplayLines{

    private record: MemberSummary;

    constructor(
        private translate: TranslateService,
        fullRecordData: Member
        ) {
            super(fullRecordData);
            this.record = fullRecordData.getSummaryView();
        }

        initTitleDisplay(): ViewLine {
            let fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.CRTDT).build());
            this.titleLine = new ViewLine(new ViewFieldBuilder().build(), fieldsArray);
            return this.titleLine;
        }

        initContentDisplay(): Array<ViewLine> {
            
            return this.viewLines;
        }
}

export class MemberFullDisplay extends IDisplayLines{
    private record: MemberFull;
    constructor(fullViewRecord: Member) {
        super(fullViewRecord);
        this.record = fullViewRecord.getFullView();
    }
    initContentDisplay(){
        this.viewLines = new Array<ViewLine>();
        let fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().label('ILL.MemberInfo.MemberID').content(this.record.ID).build());
        fieldsArray.push(new ViewFieldBuilder().label('ILL.MemberInfo.CreateDate').content(this.dateFormatDisplay(this.record.CRTDT)).build());
        fieldsArray.push(new ViewFieldBuilder().label('ILL.MemberInfo.UpdateDate').content(this.dateFormatDisplay(this.record.RNWDT)).build());
        this.addLine(new ViewFieldBuilder().build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.NAME).build());
        fieldsArray.push(new ViewFieldBuilder().label("|| ").content(this.record.NAMER).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.ParticipatingOrganizationName').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.RYAKU).build());
        fieldsArray.push(new ViewFieldBuilder().label("|| ").content(this.record.RYAKUR).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.ParticipatingOrganizationAbbreviation').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().label('ILL.MemberInfo.PostalCode').content(this.record.ZIP).build());
        fieldsArray.push(new ViewFieldBuilder().label('ILL.MemberInfo.StreetAddress').content(this.record.ADDRESS).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.Address').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.ILLDEPT).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.ILLDepartment').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.ILLSTAFF).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.ILLPersonInCharge').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.TEL).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.PhoneNumber').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.FAX).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.Fax').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.SETCODE).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.EstablisherType').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.ORGCODE).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.InstitutionType').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.CATFLG).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.CATParticipationType').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.ILLFLG).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.ILLParticipationType').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.COPYS).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.CopyServiceType').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.LOANS).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.LendingServiceType').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.FAXS).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.FAXServiceType').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.STAT).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.ServiceStatus').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.COPYAL).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.CopyReceptionHallCode').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.LOANAL).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.RentalAndBorrowingCenterCode').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.LOANP).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.LendingPeriod').build(), fieldsArray);

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.KENCODE).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.RegionPrefectureCode').build(), fieldsArray);

        
        for(let i = 0; i < this.record.CATDEPT.length; i++){
            fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.CATDEPT[i]).build());
            if(this.record.CATTEL.length >= i){
                fieldsArray.push(new ViewFieldBuilder().label('ILL.MemberInfo.PhoneNum').content(this.record.CATTEL[i]).build());       
            }
            if(this.record.CATFAX.length >= i){
                fieldsArray.push(new ViewFieldBuilder().label('ILL.MemberInfo.Fax').content(this.record.CATFAX[i]).build());       
            }
            this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.RegionPrefectureCode').build(), fieldsArray);
        }
        
        for(let i = 0; i < this.record.SYSDEPT.length; i++){
            fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.SYSDEPT[i]).build());
            if(this.record.SYSTEL.length >= i){
                fieldsArray.push(new ViewFieldBuilder().label('ILL.MemberInfo.PhoneNum').content(this.record.SYSTEL[i]).build());       
            }
            if(this.record.SYSFAX.length >= i){
                fieldsArray.push(new ViewFieldBuilder().label('ILL.MemberInfo.Fax').content(this.record.SYSFAX[i]).build());       
            }
            this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.SystemDepartment').build(), fieldsArray);
        }
        
        for(let i = 0; i < this.record.EMAIL.length; i++){
            fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.EMAIL[i]).build());
            this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.Email').build(), fieldsArray);
        }

        for(let i = 0; i < this.record.POLICY.length; i++){
            fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.POLICY[i]).build());
            this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.ILLPolicy').build(), fieldsArray);
        }

        for(let i = 0; i < this.record.LOC.length; i++){
            fieldsArray = new Array<ViewField>();
            fieldsArray.push(new ViewFieldBuilder().content(this.record.LOC[i]).build());
            this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.LocationCode').build(), fieldsArray);
        }

        fieldsArray = new Array<ViewField>();
        fieldsArray.push(new ViewFieldBuilder().content(this.record.GRPCODE).build());
        this.addLine(new ViewFieldBuilder().label('ILL.MemberInfo.OffsetCode').build(), fieldsArray);

        return this.viewLines;
    }
}



export class MemberSummary{
    ID: string;
    CRTDT: string;
}


export class MemberFull{
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


