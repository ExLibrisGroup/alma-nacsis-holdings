import { Component,  OnInit, OnChanges} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HoldingsService, DisplayHoldingResult} from '../../service/holdings.service';
import { AlertService, CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';
import { AppRoutingState, REQUEST_EXTERNAL_ID, ROUTING_STATE_KEY,LIBRARY_MEMBERINFO_KEY,SELECTED_RECORD_LIST_ILL,SELECTED_RECORD_ILL, ILL_REQUEST_FIELDS, SELECTED_INTEGRATION_PROFILE, SELECTED_REQUEST_TYPE } from '../../service/base.service';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { IllService, RequestFields, BIBG, HMLG } from '../../service/ill.service';
import { SearchType } from '../../user-controls/search-form/search-form-utils';
import { initResourceInformationFormGroup, initRequesterInformationFormGroup, initRotaFormGroup } from '../holdingSearch/holdingSearch-utils';
import { ErrorStateMatcher } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { mergeMap } from 'rxjs/operators';
import { concat, of } from 'rxjs';
import { ConfigurationService } from '../../service/configuration.service';


@Component({
  selector: 'ILL-requestForm',
  templateUrl: './requestForm.component.html',
  styleUrls: ['./requestForm.component.scss'],

})

export class RequestFormComponent implements OnInit, OnChanges {
  //basic variable
  nacsisId: string;
  mmsTitle: string;
  owners: any[];
  loading = false;
  selected: string;
  backSession;
  currentSearchType: SearchType = SearchType.Monographs;
  panelStateResourceInformation: boolean = true;
  panelStateRota: boolean = true;
  panelStateRequestInformation: boolean = true;
  formResourceInformation: FormGroup;
  formRequesterInformation: FormGroup;
  formRotamation: FormGroup;
  rMsg:string;
  selectedData: any = [];
  fullRecordData: any = [];
  localMemberInfo: any = [];

  //autofill fields
  titleAuto: string;
  publicationAuto: string;
  pub_yearAuto: string;
  quantityAuto: string;
  sizeAuto: string;
  volFirstAuto: string;
  volLastAuto: string;
  vlyrAuto:string;
  standardNumber: string;
  dataPubArrayAuto: any[];
  dataVolArrayAuto: any[];
  bibIDAuto: string;
  externalAuto: string;
  applicantNameAuto: string;
  applicantAffiliationAuto: string;
  rsLibraryName: string;
  rsLibraryCode: string;
  requestType :string;
  amlida:string;
  

  illStaffAuto:string;
  illTelAuto:string;
  illFaxAuto:string;
  illZipAuto:string;
  illNameAuto:string;
  illDeptAuto:string;
  illAddrAuto:string;

  stickyFieldsMap = new Map();
  
  requestTypeList = [
    { value: 'COPYO', viewValue: 'ILL.OptionViewValue.requestTypeList.Copy' },
    { value: 'LOANO', viewValue: 'ILL.OptionViewValue.requestTypeList.Loan' }
  ];
  commentsType = new FormControl();
  commentsTypeList: CommentsType[] = [
    { value: 'Comment1', viewValue: 'Comment1' },
    { value: 'Comment2', viewValue: 'Comment2' }
  ];

  payClass = new FormControl('', Validators.required);
  payClassList: PayClass[] = [
    { value: 'co', viewValue: 'ILL.OptionViewValue.payClassList.ResearchExpenses' },
    { value: 'ho', viewValue: 'ILL.OptionViewValue.payClassList.UniversityHospital' },
    { value: 'pb', viewValue: 'ILL.OptionViewValue.payClassList.NationalSchool' },
    { value: 'pr', viewValue: 'ILL.OptionViewValue.payClassList.PrivateExpense' },
    { value: 're', viewValue: 'ILL.OptionViewValue.payClassList.Laboratory' }
  ];

  copyType = new FormControl();
  copyTypeList: CopyType[] = [
    { value: '', viewValue: '' },
    { value: 'Electronic copy', viewValue: 'ILL.OptionViewValue.copyTypeList.ElectronicCopy' },
    { value: 'FAX', viewValue: 'ILL.OptionViewValue.copyTypeList.FAX' },
    { value: 'eDDS', viewValue: 'ILL.OptionViewValue.copyTypeList.eDDS' },
    { value: 'Stretch', viewValue: 'ILL.OptionViewValue.copyTypeList.Stretch' },
    { value: 'Microfitsyu', viewValue: 'ILL.OptionViewValue.copyTypeList.Microfitsyu' },
    { value: 'Microfilm', viewValue: 'ILL.OptionViewValue.copyTypeList.Microfilm' },
    { value: 'Reader printer ', viewValue: 'ILL.OptionViewValue.copyTypeList.ReaderPrinter' },
    { value: 'Slide', viewValue: 'ILL.OptionViewValue.copyTypeList.Slide' },
    { value: 'Copy order', viewValue: 'ILL.OptionViewValue.copyTypeList.CopyOrder' }
  ];

  sendingMethod = new FormControl();
  sendingMethodList: SendingMethod[] = [
    { value: 'Regular', viewValue: 'ILL.OptionViewValue.sendingMethodList.Regular' },
    { value: 'Express', viewValue: 'ILL.OptionViewValue.sendingMethodList.Express' },
    { value: 'DDS', viewValue: 'ILL.OptionViewValue.sendingMethodList.DDS' },
    { value: 'FAX', viewValue: 'ILL.OptionViewValue.sendingMethodList.FAX' },
    { value: 'Registered_mail', viewValue: 'ILL.OptionViewValue.sendingMethodList.RegisteredMail' },
    { value: 'Regular_mail', viewValue: 'ILL.OptionViewValue.sendingMethodList.RegularMail' },
    { value: 'Mail ', viewValue: 'ILL.OptionViewValue.sendingMethodList.Mail' },
    { value: 'eDDS', viewValue: 'ILL.OptionViewValue.sendingMethodList.eDDS' }
  ];

  dataSourceRota = new MatTableDataSource<DisplayHoldingResult>();
  matcher = new MyErrorStateMatcher();
  OADRS = new FormControl('', [Validators.required]);
  OSTAF = new FormControl('', [Validators.required]);
  BIBNT = new FormControl('', [Validators.required]);
  ODATE = new FormControl(new Date().toISOString());
  RS_LIBRARY = new FormControl('', [Validators.required]);


  requestBody = new Array();
  rotaFormControlName = ['HMLID', 'HMLNM', 'LOC', 'VOL', 'CLN', 'RGTN','AMLIDA'];
  isAllFieldsFilled: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private illService: IllService,
    private translate: TranslateService,
    private nacsis: HoldingsService,
    private alert: AlertService,
    private storeService: CloudAppStoreService,
    private configService: ConfigurationService

    
  ) {
    this.owners = [
      { id: "0", name: "Holdings.ViewHoldings.All" },
      { id: "1", name: "Holdings.ViewHoldings.Mine" }
    ];
  }

  ngOnInit() {
  
    this.nacsisId = this.route.snapshot.params['nacsisId'];
    this.mmsTitle = this.route.snapshot.params['mmsTitle'];
    this.currentSearchType = this.route.snapshot.params['searchType'];
    this.formResourceInformation = initResourceInformationFormGroup();
    this.formRequesterInformation = initRequesterInformationFormGroup();
    this.formRotamation = initRotaFormGroup();
    this.storeService.get(SELECTED_REQUEST_TYPE).subscribe((value) => {
      if (!value || (value !== 'LOANO' && value !== 'COPYO')) {
        this.requestType = 'COPYO';
       } else{
      this.requestType =value;}
    });
    this.storeService.get(SELECTED_RECORD_ILL).pipe(
      mergeMap(fullRecordData =>{
        this.fullRecordData = JSON.parse(fullRecordData);
        return this.storeService.get(SELECTED_RECORD_LIST_ILL);
      }),
      mergeMap(selectedData => {
        this.selectedData = JSON.parse(selectedData);
        this.ngOnChanges(this.selectedData);
        return this.storeService.get(LIBRARY_MEMBERINFO_KEY);
      }),
      mergeMap(localMemberInfo => {
        this.localMemberInfo = JSON.parse(localMemberInfo);
        return this.storeService.get(SELECTED_INTEGRATION_PROFILE);
      }),
       mergeMap(profile =>{
        let parsedProfile = JSON.parse(profile);
        this.rsLibraryCode = parsedProfile.rsLibraryCode;
        this.rsLibraryName = parsedProfile.rsLibraryName;
        return this.storeService.get(ILL_REQUEST_FIELDS);
      }),
      mergeMap(stickyFields => {
        if(!this.illService.isObjectEmpty(stickyFields)){
          this.stickyFieldsMap =  this.illService.Json2Map(stickyFields);
          this.setValueToFormControl();
        } 
        this.extractSelectedData();  
        this.extractFullData(this.fullRecordData);
        this.extractLocalMemberInfo(this.localMemberInfo);
        return of();
      })
    ).subscribe();
  }

  setValueToFormControl() {
    this.copyType.setValue(this.stickyFieldsMap.get('TYPE'));
    this.sendingMethod.setValue(this.stickyFieldsMap.get('SPVIA'));
    this.payClass.setValue(this.stickyFieldsMap.get('ACCT'));
  }

  extractFullData(fullRecordData) {

    this.titleAuto = fullRecordData.TRD;
    this.dataPubArrayAuto = fullRecordData.PUB;
    if (this.dataPubArrayAuto.length > 0) {
      this.publicationAuto = this.dataPubArrayAuto[0].PUBL;
    }
    this.pub_yearAuto = fullRecordData.PUBDT;
    this.quantityAuto = fullRecordData.PHYSP;
    this.sizeAuto = fullRecordData.PHYSS;
    this.dataVolArrayAuto = fullRecordData.VOLG;
    if (this.dataVolArrayAuto != null && this.dataVolArrayAuto.length > 0) {
      this.volFirstAuto = this.dataVolArrayAuto[0].VOL;
      if (this.dataVolArrayAuto.length > 0) {
        this.volLastAuto = this.dataVolArrayAuto[this.dataVolArrayAuto.length - 1].VOL;
      }
    }
    this.vlyrAuto = fullRecordData.VLYR;
    this.bibIDAuto = this.nacsisId;
    this.storeService.get(REQUEST_EXTERNAL_ID).subscribe((externalAuto)=>{
      this.externalAuto = externalAuto;
    });

    this.formResourceInformation.controls.BIBID.setValue(this.bibIDAuto);
    this.formResourceInformation.controls.BIBNT.setValue(this.buildBibMetadata());
    this.setStandardNumber(fullRecordData);
    if(!this.illService.isEmpty(this.standardNumber))
    this.formResourceInformation.controls.STDNO.setValue(this.standardNumber);
  }

  private setStandardNumber(fullRecordData) : void {
    if(!this.illService.isEmpty(fullRecordData.LCCN)) {
      this.standardNumber = 'LCCN=' + fullRecordData.LCCN;
    }
    else if(!this.illService.isEmpty(fullRecordData.ISSN)) {
      this.standardNumber = 'ISSN=' + fullRecordData.ISSN;
    }
    else if(fullRecordData.VOLG !== undefined && !this.illService.isEmpty(fullRecordData.VOLG[0]?.ISBN)) {
      this.standardNumber = 'ISBN=' + fullRecordData.VOLG[0]?.ISBN;
    }
  }

  extractSelectedData() {
    this.rotaFormControlName.forEach(conrtolName => {
      for (let i = 1; i <= this.selectedData.length; i++) {
        let tag = conrtolName + i;
        this.setValueForFormRota(tag);
      }
    })
  }

  extractLocalMemberInfo(localMemberInfo){
    if(localMemberInfo.length > 0 ){
      this.illStaffAuto = localMemberInfo[0].ILLSTAFF;
      this.illDeptAuto = localMemberInfo[0].ILLDEPT;
      this.illFaxAuto = localMemberInfo[0].FAX;
      this.illZipAuto = localMemberInfo[0].ZIP;
      this.illAddrAuto = localMemberInfo[0].ADDRESS;
      this.illNameAuto = localMemberInfo[0].NAME;
      this.illTelAuto = localMemberInfo[0].TEL;

      this.formRequesterInformation.controls.OSTAF.setValue(this.buildRequesterStaff());
      this.formRequesterInformation.controls.OADRS.setValue(this.buildRequesterAddress());
      this.formRequesterInformation.controls.RS_LIBRARY.setValue(this.rsLibraryName);

    }
  }


  setValueForFormRota(tag) {
    let tagName = tag.substr(0, tag.length - 1);
    let tagSequence = tag.substr(tag.length - 1, tag.length);

    switch (tagName) {
      case 'HMLID':
        this.formRotamation.get(tag).setValue(this.selectedData[tagSequence - 1].fano);
        break;
      case 'HMLNM':
        this.formRotamation.get(tag).setValue(this.selectedData[tagSequence - 1].name);
        break;
      case 'LOC':
        this.formRotamation.get(tag).setValue(this.selectedData[tagSequence - 1].location);
        break;
      case 'VOL':
        if (!this.illService.isEmpty(this.selectedData[tagSequence - 1].vol))
          this.formRotamation.get(tag).setValue(this.selectedData[tagSequence - 1].vol[0].VOL);
        break;
      case 'CLN':
        if (!this.illService.isEmpty(this.selectedData[tagSequence - 1].vol))
          this.formRotamation.get(tag).setValue(this.selectedData[tagSequence - 1].vol[0].CLN);
        break;
      case 'RGTN':
        if (!this.illService.isEmpty(this.selectedData[tagSequence - 1].vol))
          this.formRotamation.get(tag).setValue(this.selectedData[tagSequence - 1].vol[0].RGTN);
        break;
      case 'AMLIDA':
            this.formRotamation.get(tag).setValue(this.selectedData[tagSequence - 1].fano);
        break;
    }
  }


  buildBibMetadata() {
    let bibMetadata = "";
    bibMetadata = bibMetadata + (this.illService.isEmpty(this.titleAuto) ? "" : this.titleAuto + ";");
    bibMetadata = bibMetadata + (this.illService.isEmpty(this.volFirstAuto) ? "" : this.volFirstAuto);
    bibMetadata = bibMetadata + (this.illService.isEmpty(this.volLastAuto) ? "" : " - " + this.volLastAuto + ".");
    bibMetadata = bibMetadata + ((this.illService.isEmpty(this.volFirstAuto) && this.illService.isEmpty(this.volLastAuto)) ? "" : " -- ");
    
    bibMetadata = bibMetadata + (this.illService.isEmpty(this.vlyrAuto) ? "" : this.vlyrAuto + " .-- ");
    bibMetadata = bibMetadata + (this.illService.isEmpty(this.publicationAuto) ? "" : this.publicationAuto + ", ");
    bibMetadata = bibMetadata + (this.illService.isEmpty(this.pub_yearAuto) ? "" : this.pub_yearAuto + ". ");
    bibMetadata = bibMetadata + ((this.illService.isEmpty(this.quantityAuto) && this.illService.isEmpty(this.sizeAuto)) ? "" : " -- ");
    bibMetadata = bibMetadata + (this.illService.isEmpty(this.quantityAuto) ? "" : this.quantityAuto + "; ");
    bibMetadata = bibMetadata + (this.illService.isEmpty(this.sizeAuto) ? "" : this.sizeAuto + ". ");
    return bibMetadata;
  }
  buildRequesterStaff() {
  let  requesterStaff = "";
  if(this.configService.config != undefined && this.configService.config.rmsg!=undefined){
    requesterStaff = this.configService.config.rmsg;}
    if (!this.illService.isEmpty(requesterStaff)) {
        return requesterStaff;
    }
    requesterStaff += this.illService.isEmpty(this.illStaffAuto) ? "" : this.illStaffAuto + " ";
    requesterStaff += this.illService.isEmpty(this.illDeptAuto) ? "" : this.illDeptAuto + " ";
    requesterStaff += this.illService.isEmpty(this.illTelAuto) ? "" : "TEL=" + this.illTelAuto + " ";
    requesterStaff += this.illService.isEmpty(this.illFaxAuto) ? "" : "FAX=" + this.illFaxAuto;
    
    return requesterStaff.trim();
}


  buildRequesterAddress(){
    let requesterAddress = "";
    requesterAddress = requesterAddress + (this.illService.isEmpty(this.illZipAuto) ? "" : "〒" + this.illZipAuto + " ");
    requesterAddress = requesterAddress + (this.illService.isEmpty(this.illAddrAuto) ? "" : this.illAddrAuto + " ");
    requesterAddress = requesterAddress + (this.illService.isEmpty(this.illNameAuto) ? "" : this.illNameAuto + " ");
    requesterAddress = requesterAddress + (this.illService.isEmpty(this.illDeptAuto) ? "" : this.illDeptAuto);
    return requesterAddress;
  }


  ngOnChanges(holdings) {
    this.dataSourceRota = new MatTableDataSource<DisplayHoldingResult>(holdings);
  }

  backToHoldingSearch() {
    this.stickyFieldsMap.set('TYPE', this.copyType.value);
    this.stickyFieldsMap.set('SPVIA', this.sendingMethod.value);
    this.stickyFieldsMap.set('ACCT', this.payClass.value);
    concat(
      this.storeService.set(ILL_REQUEST_FIELDS, this.illService.map2Json(this.stickyFieldsMap)),
      this.storeService.set(ROUTING_STATE_KEY, AppRoutingState.SearchRecordMainPage)
    ).subscribe();
    this.router.navigate(['holdingSearch', this.nacsisId, this.mmsTitle, this.currentSearchType]);
  }


  getDisplayedColumns(): string[] {
    return ['id', 'fano', 'name', 'location', 'vol', 'callNumber',
      'registrationNumber', 'bid','amlida'];
  }


  panelOpenStateResourceInformation() {
    this.panelStateResourceInformation = true;
  }

  panelCloseStateResourceInformation() {
    this.panelStateResourceInformation = false;
  }


  panelOpenStateRota() {
    this.panelStateRota = true;
  }

  panelCloseStateRota() {
    this.panelStateRota = false;
  }

  panelOpenStateRequestInformation() {
    this.panelStateRequestInformation = true;
  }

  panelCloseStateRequestInformation() {
    this.panelStateRequestInformation = false;
  }


  showVolDetal(element, tag) {
    let str = "";
    let volumeArr = element.vol;
    if (!this.illService.isEmpty(volumeArr)) {
      switch (tag) {
        case 'VOL':
          str = volumeArr[0].VOL;
          break;
        case 'CLN':
          str = volumeArr[0].CLN;
          break;
        case 'RGTN':
          str = volumeArr[0].RGTN;
          break;
      }
    }
    return str;
  }

  order() {
    //check required fields
    this.setFormGroupTouched(this.formResourceInformation);
    this.setFormGroupTouched(this.formRequesterInformation);
    // this.requestType.markAsTouched({ onlySelf: true });
    this.payClass.markAsTouched({ onlySelf: true });
    this.copyType.markAsTouched({ onlySelf: true });
    this.checkFieldRequired();

    if (this.isAllFieldsFilled) {
      this.buildRequestBody();
      this.sendToIllCreateRequest(this.requestBody);
    } else {
      this.panelStateRequestInformation = true;
      this.panelStateResourceInformation = true;
    }

    this.stickyFieldsMap.set('TYPE', this.copyType.value);
    this.stickyFieldsMap.set('SPVIA', this.sendingMethod.value);
    this.stickyFieldsMap.set('ACCT', this.payClass.value);
    this.storeService.set(ILL_REQUEST_FIELDS, this.illService.map2Json(this.stickyFieldsMap))
  }


  setFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control.markAsTouched({ onlySelf: true });
    });
  }

  buildRequestBody() {

    this.requestBody = new Array();
    let item = new RequestFields;
    // formResourceInformation
    item._DBNAME_ = [this.requestType];
    item.ACCT = [this.payClass.value];
    item.TYPE = [this.copyType.value];
    item.SPVIA = this.illService.isEmpty(this.sendingMethod.value) ? [] : [this.sendingMethod.value];
    item.ONO = this.illService.isEmpty(this.formResourceInformation.value.ONO) ? [] : [this.formResourceInformation.value.ONO];
    item.PRMT = this.illService.isEmpty(this.formResourceInformation.value.PRMT) ? [] : [this.formResourceInformation.value.PRMT];
    //TODO check it again, thare is any meaning?
    item.ID = [this.externalAuto];//sessionStorage.getItem(REQUEST_EXTERNAL_ID);
    //TODO: make sure the bibg couldn't repeatable 
    item.BIBG = new Array();
    let bibg = new BIBG();
    bibg.BIBID = this.illService.isEmpty(this.formResourceInformation.value.BIBID)? this.nacsisId: this.formResourceInformation.value.BIBID;
    bibg.BIBNT = this.formResourceInformation.value.BIBNT;
    bibg.STDNO = this.formResourceInformation.value.STDNO;
    item.BIBG.push(bibg);

    item.VLNO = this.illService.isEmpty(this.formResourceInformation.value.VOL) ? [] : [this.formResourceInformation.value.VOL];
    item.PAGE = this.illService.isEmpty(this.formResourceInformation.value.PAGE) ? [] : [this.formResourceInformation.value.PAGE];
    item.YEAR = this.illService.isEmpty(this.formResourceInformation.value.YEAR) ? [] : [this.formResourceInformation.value.YEAR];
    item.ARTCL = this.illService.isEmpty(this.formResourceInformation.value.ARTCL) ? [] : [this.formResourceInformation.value.ARTCL];

    //formRotamation
    item.HMLG = new Array();

    for (let i = 1; i <= this.selectedData.length; i++) {
      let hmlgs = new HMLG();
      this.rotaFormControlName.forEach(controlName => {
        hmlgs[controlName] = this.illService.isEmpty(this.formRotamation.get(controlName + i).value) ? "" : this.formRotamation.get(controlName + i).value;
      })
      item.HMLG.push(hmlgs);
    }

    item.HMLG = item.HMLG.filter(hmlg=>{
        return !this.illService.isEmpty(hmlg.HMLID + hmlg.HMLNM + hmlg.LOC + hmlg.VOL + hmlg.CLN + hmlg.RGTN +hmlg.AMLIDA);
    })

    //formRequesterInformation
    item.BVRFY = this.illService.isEmpty(this.formRequesterInformation.value.BVRFY) ? [] : [this.formRequesterInformation.value.BVRFY];
    item.HVRFY = this.illService.isEmpty(this.formRequesterInformation.value.HVRFY) ? [] : [this.formRequesterInformation.value.HVRFY];
    item.CLNT = this.illService.isEmpty(this.formRequesterInformation.value.CLNT) ? [] : [this.formRequesterInformation.value.CLNT];
    item.CLNTP = this.illService.isEmpty(this.formRequesterInformation.value.CLNTP) ? [] : [this.formRequesterInformation.value.CLNTP];
    item.ODATE = [new DatePipe('en').transform(this.ODATE.value, 'yyyyMMdd')];
    item._COMMENT_ = this.illService.isEmpty(this.formRequesterInformation.value.SENDCMNT) ? [] : [this.formRequesterInformation.value.SENDCMNT];
    item.OSTAF = [this.formRequesterInformation.value.OSTAF];
    item.OADRS = [this.formRequesterInformation.value.OADRS];
    item.OLDF = this.illService.isEmpty(this.formRequesterInformation.value.OLDF) ? [] : [this.formRequesterInformation.value.OLDF];
    item.OLDAF = this.illService.isEmpty(this.formRequesterInformation.value.OLDAF) ? [] : [this.formRequesterInformation.value.OLDAF];
    //item.OEDA = this.illService.isEmpty(this.formRequesterInformation.value.OEDA) ? [] : [this.formRequesterInformation.value.OEDA];


    this.requestBody.push(item);
  }

  checkFieldRequired() {
    let needToCheckFields = [ this.payClass.value,
    this.formResourceInformation.value.BIBNT,  this.formRequesterInformation.value.OSTAF,
    this.formRequesterInformation.value.OADRS, this.formRequesterInformation.value.RS_LIBRARY];
    this.isAllFieldsFilled = true;
    needToCheckFields.forEach(fieldValue => {
      if (this.isAllFieldsFilled) {
        if (this.illService.isEmpty(fieldValue)) {
          this.isAllFieldsFilled = false;
        }
      }
    })
    return this.isAllFieldsFilled;
  }

  sendToIllCreateRequest(requestBody) {
    this.loading = true;

    try {

      this.illService.createILLrequest(requestBody)
      .subscribe({
        next: (header) => {
          console.log(header);
          if (header.status === this.nacsis.OkStatus) {
            let requestID = header.requestId;
            console.log(requestID);
            this.alert.success(this.translate.instant('ILL.Main.CreateILLSuccess') + requestID, {autoClose:false,keepAfterRouteChange:true,delay:10000});  
            this.router.navigate(['/ILL']);
          } else {
            this.alert.error(header.errorMessage, {keepAfterRouteChange:true});  
          }
        },
        error: e => {
          this.loading = false;
          console.log(e.message);
          this.alert.error(e.message, {keepAfterRouteChange:true});
        },
        complete: () => this.loading = false
      });

    } catch (e) {
      this.loading = false;
      console.log(e);
      this.alert.error(this.translate.instant('General.Errors.generalError'), { keepAfterRouteChange: true });
    }
  }

  onRequestTypeSelected(){
    if(this.requestType=== 'COPYO'){
      this.copyType.setValue('Electronic copy');
    }
  }
  getViewValueByValue(value: string): string {
    const selectedType = this.requestTypeList.find(type => type.value === value);
    return selectedType ? selectedType.viewValue : '';
  }

}


interface RequestType {
  value: string;
  viewValue: string;
}

interface PayClass {
  value: string;
  viewValue: string;
}

interface CopyType {
  value: string;
  viewValue: string;
}

interface SendingMethod {
  value: string;
  viewValue: string;
}

interface CommentsType {
  value: string;
  viewValue: string;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
