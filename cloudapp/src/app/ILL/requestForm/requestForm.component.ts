import { Component,  OnInit, OnChanges} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HoldingsService, DisplayHoldingResult} from '../../service/holdings.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { AppRoutingState, REQUEST_EXTERNAL_ID, ROUTING_STATE_KEY,LIBRARY_MEMBERINFO_KEY,SELECTED_RECORD_LIST_ILL,SELECTED_RECORD_ILL } from '../../service/base.service';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { IllService, RequestFields, Bibg, HMLG } from '../../service/ill.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CatalogService } from '../../service/catalog.service';
import { SearchType } from '../../user-controls/search-form/search-form-utils';
import { initResourceInformationFormGroup, initRequesterInformationFormGroup, initRotaFormGroup, FieldName } from '../holdingSearch/holdingSearch-utils';
import { ErrorStateMatcher } from '@angular/material/core';
import { DatePipe } from '@angular/common';

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
  selecedData: any = [];
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
  lccnAuto: string;
  dataPubArrayAuto: any[];
  dataVolArrayAuto: any[];
  bibIDAuto: string;
  externalAuto: string;

  illStaffAuto:string;
  illTelAuto:string;
  illFaxAuto:string;
  illZipAuto:string;
  illNameAuto:string;
  illDeptAuto:string;
  illAddrAuto:string;

  requestType = new FormControl();
  requestTypeList: RequestType[] = [
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

  requestBody = new Array();
  rotaFormControlName = ['HMLID', 'HMLNM', 'LOC', 'VOL', 'CLN', 'RGTN'];
  isAllFieldsFilled: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private illService: IllService,
    private catalogService: CatalogService,
    //private http: HttpClient,
    private translate: TranslateService,
    private nacsis: HoldingsService,
    private dialog: MatDialog,
    private alert: AlertService,
    private _liveAnnouncer: LiveAnnouncer,
    private routeInfo: ActivatedRoute
  ) {
    this.owners = [
      { id: "0", name: this.translate.instant('Holdings.ViewHoldings.All') },
      { id: "1", name: this.translate.instant('Holdings.ViewHoldings.Mine') }
    ];
  }

  ngOnInit() {

    this.nacsisId = this.route.snapshot.params['nacsisId'];
    this.mmsTitle = this.route.snapshot.params['mmsTitle'];
    this.currentSearchType = this.route.snapshot.params['searchType'];
    this.fullRecordData = JSON.parse(sessionStorage.getItem(SELECTED_RECORD_ILL));
    this.selecedData = JSON.parse(sessionStorage.getItem(SELECTED_RECORD_LIST_ILL));
    this.localMemberInfo = JSON.parse(sessionStorage.getItem(LIBRARY_MEMBERINFO_KEY));
    this.ngOnChanges(this.selecedData);
    this.formResourceInformation = initResourceInformationFormGroup();
    this.formRequesterInformation = initRequesterInformationFormGroup();
    this.formRotamation = initRotaFormGroup();
    this.panelStateResourceInformation = false;
    this.panelStateRota = true;
    this.panelStateRequestInformation = false;
    this.extractFullData(this.fullRecordData);
    this.extractSelectedData();
    this.extractLocalMemberInfo(this.localMemberInfo);

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
    this.lccnAuto = fullRecordData.LCCN;
    this.dataVolArrayAuto = fullRecordData.VOLG;
    if (this.dataVolArrayAuto != null && this.dataVolArrayAuto.length > 0) {
      this.volFirstAuto = this.dataVolArrayAuto[0].VOL;
      if (this.dataVolArrayAuto.length > 1) {
        this.volLastAuto = this.dataVolArrayAuto[this.dataVolArrayAuto.length - 1].VOL;
      }
    }
    this.vlyrAuto = fullRecordData.VLYR;
    this.bibIDAuto = this.nacsisId;
    this.externalAuto = sessionStorage.getItem(REQUEST_EXTERNAL_ID);


    this.formResourceInformation.controls.BIBID.setValue(this.bibIDAuto);
    this.formResourceInformation.controls.BIBNT.setValue(this.buildBibMetadata());
    if(!this.illService.isEmpty(this.lccnAuto))
    this.formResourceInformation.controls.STDNO.setValue('LCCN=' + this.lccnAuto);
  }

  extractSelectedData() {
    this.rotaFormControlName.forEach(conrtolName => {
      for (let i = 1; i <= this.selecedData.length; i++) {
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
    }
  }


  setValueForFormRota(tag) {
    let tagName = tag.substr(0, tag.length - 1);
    let tagSequence = tag.substr(tag.length - 1, tag.length);

    switch (tagName) {
      case 'HMLID':
        this.formRotamation.get(tag).setValue(this.selecedData[tagSequence - 1].fano);
        break;
      case 'HMLNM':
        this.formRotamation.get(tag).setValue(this.selecedData[tagSequence - 1].name);
        break;
      case 'LOC':
        this.formRotamation.get(tag).setValue(this.selecedData[tagSequence - 1].location);
        break;
      case 'VOL':
        if (!this.illService.isEmpty(this.selecedData[tagSequence - 1].vol))
          this.formRotamation.get(tag).setValue(this.selecedData[tagSequence - 1].vol[0].VOL);
        break;
      case 'CLN':
        if (!this.illService.isEmpty(this.selecedData[tagSequence - 1].vol))
          this.formRotamation.get(tag).setValue(this.selecedData[tagSequence - 1].vol[0].CLN);
        break;
      case 'RGTN':
        if (!this.illService.isEmpty(this.selecedData[tagSequence - 1].vol))
          this.formRotamation.get(tag).setValue(this.selecedData[tagSequence - 1].vol[0].RGTN);
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

  buildRequesterStaff(){
    let requesterStaff = "";
    requesterStaff = requesterStaff + (this.illService.isEmpty(this.illStaffAuto) ? "" : this.illStaffAuto + " ");
    requesterStaff = requesterStaff + (this.illService.isEmpty(this.illDeptAuto) ? "" : this.illDeptAuto + " ");
    requesterStaff = requesterStaff + (this.illService.isEmpty(this.illTelAuto) ? "" : "TEL=" + this.illTelAuto + " ");
    requesterStaff = requesterStaff + (this.illService.isEmpty(this.illFaxAuto) ? "" : "FAX=" + this.illFaxAuto);
    return requesterStaff;
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
    sessionStorage.setItem(ROUTING_STATE_KEY, AppRoutingState.SearchRecordMainPage);
    this.router.navigate(['holdingSearch', this.nacsisId, this.mmsTitle, this.currentSearchType]);
  }


  getDisplayedColumns(): string[] {
    return ['id', 'index', 'fano', 'name', 'location', 'vol', 'callNumber',
      'registrationNumber', 'bid'];
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
    this.requestType.markAsTouched({ onlySelf: true });
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
    item.database = this.requestType.value;
    item.ACCT = this.payClass.value;
    item.TYPE = this.copyType.value;
    item.SPVIA = this.illService.isEmpty(this.sendingMethod.value) ? "" : this.sendingMethod.value;
    item.ONO = this.illService.isEmpty(this.formResourceInformation.value.ONO) ? "" : this.formResourceInformation.value.ONO;
    item.PRMT = this.illService.isEmpty(this.formResourceInformation.value.PRMT) ? "" : this.formResourceInformation.value.PRMT;
    item.EXTERNAL_ID = this.externalAuto;//sessionStorage.getItem(REQUEST_EXTERNAL_ID);
    let bibg = new Bibg();
  
    bibg.BIBID = this.illService.isEmpty(this.formResourceInformation.value.BIBID)? this.nacsisId: this.formResourceInformation.value.BIBID;
    bibg.BIBNT = this.formResourceInformation.value.BIBNT;
    bibg.STDNO = this.formResourceInformation.value.STDNO;
    item.BIBG = bibg;

    item.VOL = this.illService.isEmpty(this.formResourceInformation.value.VOL) ? "" : this.formResourceInformation.value.VOL;
    item.PAGE = this.illService.isEmpty(this.formResourceInformation.value.PAGE) ? "" : this.formResourceInformation.value.PAGE;
    item.YEAR = this.illService.isEmpty(this.formResourceInformation.value.YEAR) ? "" : this.formResourceInformation.value.YEAR;
    item.ARTCL = this.illService.isEmpty(this.formResourceInformation.value.ARTCL) ? "" : this.formResourceInformation.value.ARTCL;

    //formRotamation
    item.HMLG = new Array();

    for (let i = 1; i <= this.selecedData.length; i++) {
      let hmlgs = new HMLG();
      this.rotaFormControlName.forEach(controlName => {
        hmlgs[controlName] = this.illService.isEmpty(this.formRotamation.get(controlName + i).value) ? "" : this.formRotamation.get(controlName + i).value;
      })
      item.HMLG.push(hmlgs);
    }

    item.HMLG = item.HMLG.filter(hmlg=>{
        return !this.illService.isEmpty(hmlg.HMLID + hmlg.HMLNM + hmlg.LOC + hmlg.VOL + hmlg.CLN + hmlg.RGTN);
    })

    //formRequesterInformation
    item.BVRFY = this.illService.isEmpty(this.formRequesterInformation.value.BVRFY) ? "" : this.formRequesterInformation.value.BVRFY;
    item.HVRFY = this.illService.isEmpty(this.formRequesterInformation.value.HVRFY) ? "" : this.formRequesterInformation.value.HVRFY;
    item.CLNT = this.illService.isEmpty(this.formRequesterInformation.value.CLNT) ? "" : this.formRequesterInformation.value.CLNT;
    item.CLNTP = this.illService.isEmpty(this.formRequesterInformation.value.CLNTP) ? "" : this.formRequesterInformation.value.CLNTP;
    item.ODATE = new DatePipe('en').transform(this.ODATE.value, 'yyyyMMdd');
    item.SENDCMNT = this.illService.isEmpty(this.formRequesterInformation.value.SENDCMNT) ? "" : this.formRequesterInformation.value.SENDCMNT;
    item.OSTAF = this.formRequesterInformation.value.OSTAF;
    item.OADRS = this.formRequesterInformation.value.OADRS;
    item.OLDF = this.illService.isEmpty(this.formRequesterInformation.value.OLDF) ? "" : this.formRequesterInformation.value.OLDF;
    item.OLDAF = this.illService.isEmpty(this.formRequesterInformation.value.OLDAF) ? "" : this.formRequesterInformation.value.OLDAF;
    item.OEDA = this.illService.isEmpty(this.formRequesterInformation.value.OEDA) ? "" : this.formRequesterInformation.value.OEDA;

    this.requestBody.push(item);
  }

  checkFieldRequired() {
    let needToCheckFields = [this.requestType.value, this.payClass.value,
    this.formResourceInformation.value.BIBNT,  this.formRequesterInformation.value.OSTAF,
    this.formRequesterInformation.value.OADRS];
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
    if(this.requestType.value === 'COPYO'){
      this.copyType.setValue('Electronic copy');
    }
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
