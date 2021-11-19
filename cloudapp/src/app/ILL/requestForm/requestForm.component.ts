import { Component, ViewChild, OnInit, OnChanges, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HoldingsService, HoldingsSearch, NacsisHoldingRecord, DisplayHoldingResult, NacsisBookHoldingsListDetail, NacsisSerialHoldingsListDetail } from '../../service/holdings.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { AppRoutingState, ROUTING_STATE_KEY, LIBRARY_ID_KEY } from '../../service/base.service';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { IllService } from '../../service/ill.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CatalogService } from '../../service/catalog.service';
import { SearchType } from '../../user-controls/search-form/search-form-utils';
import { FullViewLink } from '../../catalog/full-view-display/full-view-display.component';
import { initResourceInformationFormGroup, initRequesterInformationFormGroup, FieldName } from '../holdingSearch/holdingSearch-utils';
import { ErrorStateMatcher } from '@angular/material/core';

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
  selecedData: any = [];
  fullRecordData: any = [];

  //autofill fields
  titleAuto: string;
  publicationAuto: string;
  pub_yearAuto: string;
  quantityAuto: string;
  sizeAuto: string;
  volFirstAuto: string;
  volLastAuto: string;
  isbnAuto: string;
  issnAuto: string;
  dataPubArrayAuto: any[];
  dataVolArrayAuto: any[];

  requestType = new FormControl();
  requestTypeList: RequestType[] = [
    { value: '0', viewValue: 'Copy' },
    { value: '1', viewValue: 'Loan' }
  ];

  commentsType = new FormControl();
  commentsTypeList: CommentsType[] = [
    { value: 'Comment1', viewValue: 'Comment1' },
    { value: 'Comment2', viewValue: 'Comment2' }
  ];

  payClass = new FormControl('', Validators.required);
  payClassList: PayClass[] = [
    { value: 'co', viewValue: 'Research expenses' },
    { value: 'ho', viewValue: 'University hospital' },
    { value: 'pb', viewValue: 'National school' },
    { value: 'pr', viewValue: 'Private expense' },
    { value: 're', viewValue: 'Laboratory ' }
  ];

  copyType = new FormControl('', Validators.required);
  copyTypeList: CopyType[] = [
    { value: 'Electronic_copy', viewValue: 'Electronic copy' },
    { value: 'FAX', viewValue: 'FAX' },
    { value: 'eDDS', viewValue: 'eDDS' },
    { value: 'Stretch', viewValue: 'Stretch' },
    { value: 'Microfitsyu', viewValue: 'Microfitsyu' },
    { value: 'Microfilm', viewValue: 'Microfilm' },
    { value: 'Reader_printer ', viewValue: 'Reader printer' },
    { value: 'Slide', viewValue: 'Slide' },
    { value: 'Copy_order', viewValue: 'Copy order' }
  ];

  sendingMethod = new FormControl();
  sendingMethodList: SendingMethod[] = [
    { value: 'Regular', viewValue: 'Regular' },
    { value: 'Express', viewValue: 'Express' },
    { value: 'DDS', viewValue: 'DDS' },
    { value: 'FAX', viewValue: 'FAX' },
    { value: 'Registered_mail', viewValue: 'Registered mail' },
    { value: 'Regular_mail', viewValue: 'Regular mail' },
    { value: 'Mail ', viewValue: 'Mail' },
    { value: 'eDDS', viewValue: 'eDDS' }
  ];

  dataSourceRota = new MatTableDataSource<DisplayHoldingResult>();
  matcher = new MyErrorStateMatcher();
  OADRS = new FormControl('', [Validators.required]);
  OSTAF = new FormControl('', [Validators.required]);
  BIBID = new FormControl('', [Validators.required]);
  BIBNT = new FormControl('', [Validators.required]);
  STDNO = new FormControl('', [Validators.required]);
  ODATE = new FormControl(new Date().toISOString());

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
    this.fullRecordData = JSON.parse(sessionStorage.getItem("selecedFullRecordData"));
    this.selecedData = JSON.parse(sessionStorage.getItem("selecedData"));
    this.ngOnChanges(this.selecedData);
    this.formResourceInformation = initResourceInformationFormGroup();
    this.formRequesterInformation = initRequesterInformationFormGroup();
    this.panelStateResourceInformation = false;
    this.panelStateRota = true;
    this.panelStateRequestInformation = false;
    this.extractFullData(this.fullRecordData);
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
    if (this.dataVolArrayAuto.length > 0) {
      this.isbnAuto = this.dataVolArrayAuto[0].ISBN;
      this.volFirstAuto = this.dataVolArrayAuto[0].VOL;
      if (this.dataVolArrayAuto.length > 1) {
        this.volLastAuto = this.dataVolArrayAuto[this.dataVolArrayAuto.length - 1].VOL;
      }
    }

    this.formResourceInformation.controls.BIBNT.setValue(this.buildBibMetadata());
    this.formResourceInformation.controls.STDNO.setValue(this.isbnAuto);
    console.log(this);
  }

  buildBibMetadata() {
    let bibMetadata = "";
    bibMetadata = bibMetadata + (this.illService.isEmpty(this.titleAuto) ? "" : this.titleAuto + ";");
    bibMetadata = bibMetadata + (this.illService.isEmpty(this.volFirstAuto) ? "" : this.volFirstAuto);
    bibMetadata = bibMetadata + (this.illService.isEmpty(this.volLastAuto) ? "" : " - " + this.volLastAuto);
    bibMetadata = bibMetadata + ((this.illService.isEmpty(this.volLastAuto) && this.illService.isEmpty(this.volLastAuto)) ? "" : " -- ");
    bibMetadata = bibMetadata + (this.illService.isEmpty(this.publicationAuto) ? "" : this.publicationAuto + ", ");
    bibMetadata = bibMetadata + (this.illService.isEmpty(this.pub_yearAuto) ? "" : this.pub_yearAuto + ". ");
    bibMetadata = bibMetadata + ((this.illService.isEmpty(this.quantityAuto) && this.illService.isEmpty(this.sizeAuto)) ? "" : " -- ");
    bibMetadata = bibMetadata + (this.illService.isEmpty(this.quantityAuto) ? "" : this.quantityAuto + "; ");
    bibMetadata = bibMetadata + (this.illService.isEmpty(this.sizeAuto) ? "" : this.sizeAuto + ". ");
    return bibMetadata;
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