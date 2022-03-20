import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { HoldingsService, Holding, HoldingsBook, HoldingsSerial, Header } from '../../service/holdings.service';
import { holdingFormGroup } from './form-utils';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { Action } from '../../user-controls/result-card/result-card.component';
import { MultiSearchField, SearchField, FieldName, FieldSize, SelectSearchField } from '../../user-controls/search-form/search-form-utils';
import { AlmaApiService } from '../../service/alma.api.service';
import { VOLUME_LIST_SEPARATOR } from '../main/main.component';
import { VOLUME_LIST } from '../../service/base.service';


@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  //<input #locationInput ...>
  //@ViewChild('locationInput') locationInput: ElementRef; /*create a view child*/
  mmsId: string;
  mmsTitle: string;
  holdingId: string;
  forms: Array<Array<SearchField>>;
  loading = false;
  type: string;
  holding: Holding;
  isReadOnly: boolean;
  originLOC: string;
  volumeList: string[];
  // TODO: Concatenating locations, all volumes and LTR fields into 1 array
  allVolumes = new Array<MultiSearchField>(); // Always contains a single MultiSearchField
  ltrList = new Array<MultiSearchField>(); // Always contains a single MultiSearchField 

  title: string;
  message: string;
  isErrorMessageVisible: boolean=false;

  book: string = "BOOK";
  urlViewSigment: string = "view";

  locationFormControl = new FormControl();
  private locationsList = new Array<string>();

  constructor(
    private almaService: AlmaApiService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private nacsis: HoldingsService,
    private alert: AlertService
  ) { }

  public ACTIONS_MENU_LIST = new Array(
    new Action('Catalog.Results.Actions.Delete', false),
  );

  ngOnInit() {
    this.mmsId = this.route.snapshot.params['mmsId'];
    this.mmsTitle = this.route.snapshot.params['mmsTitle'];
    this.holdingId = this.route.snapshot.params['holdingId'];
    let joinedVolumeList = sessionStorage.getItem(VOLUME_LIST);
    this.volumeList = joinedVolumeList?.split(VOLUME_LIST_SEPARATOR); 


    this.type = this.nacsis.getHeader().type;

    this.route.snapshot.url.forEach(sigment => {
      if (sigment.path == this.urlViewSigment) {
        this.isReadOnly = true;
      }
    });

    this.loading = true;
    this.almaService.getIntegrationProfile().subscribe({
      next: (integrationProfile) => {
        this.locationsList = integrationProfile.locations;
        this.load();
      },
      error: e => {
        this.loading = false;
        console.log(e.message);
        this.alert.error(e.message, {keepAfterRouteChange:true});
      },
      complete: () => this.loading = false
    });    
  }

  load() {
    if (this.holdingId) { // existing holding
      let holding = this.nacsis.getHolding(this.holdingId);
      this.originLOC = holding.LOC;
      this.holding = holding;
      let formsLength = this.nacsis.isEmpty(this.holding.nacsisHoldingsList) ? 0 : this.holding.nacsisHoldingsList.length;
      this.forms = new Array(formsLength);

      if(formsLength > 0) {
        this.holding.nacsisHoldingsList.forEach((holdingVolume, index) => {
          this.forms[index] = this.initVolumeForm(false, holdingVolume);
        })
      } else {
        this.forms[0] = this.initVolumeForm(true);
      }
      this.ltrList.push(new MultiSearchField(this.initLtrForm(this.holding.ltrList), 1, 4));

    } else { // new holding
      this.holding = new Holding();
      this.forms = new Array();
      if(this.volumeList) {
        this.volumeList.forEach(volume => {
          this.forms.push(this.initVolumeForm(true, volume));
        });
      } else {
        this.forms.push(this.initVolumeForm(true));
      }      
      this.ltrList.push(new MultiSearchField(this.initLtrForm(), 1, 4));
    }

    this.allVolumes.push(new MultiSearchField(this.forms, 0, this.isBook()? null : 1)); // Serial records always have a single volume

  }

  getMmsInfoTitle(): string {
    return this.translate.instant('Holdings.Form.Title') + ": " + this.mmsTitle + " (" + this.mmsId + ")";
  }

  onCloseClick() {
    this.isErrorMessageVisible = false;
  }

  getLibraryFullName(): string {
    if(this.nacsis.isEmpty(this.holdingId)){
       return this.nacsis.getHeader().LIBABL + ' (' + this.nacsis.getHeader().FANO + ')'
    }
    return this.holding.LIBABL + ' (' + this.holding.FANO + ')';
  }

  // add holding volume
  add() {
    this.allVolumes[0].getFieldsArray().push(this.initVolumeForm(true));
  }

  isAddEnabled(): boolean {
    return this.isBook() || this.allVolumes[0].getFieldsArray().length == 0;
  }

  // to nacsis
   save() {
    this.loading = true;

    // validate form
    let invalid: boolean = false;

    if(this.locationFormControl.invalid) {
      this.locationFormControl.markAsTouched();
      invalid = true;
    }

    let invalidFields = new Array<SearchField>();
    this.allVolumes[0].getFieldsArray().forEach(form => {
      invalidFields.concat(form.filter(field => field.getFormControl().invalid))});
    if (invalidFields.length > 0) {
      invalidFields.forEach(field => field.getFormControl().markAsTouched());
      invalid = true;
    }

    if(invalid) {
      this.loading = false;
      return;
    }

    this.holding.BID = this.nacsis.getHeader().BID;
    this.holding.FANO = this.nacsis.getHeader().FANO;
    this.holding.LIBABL = this.nacsis.getHeader().LIBABL;
    this.holding.type = this.type;
    this.holding.editable = true;
    this.holding.ID = this.holdingId;

    this.holding.nacsisHoldingsList = new Array(this.allVolumes[0].getFieldsArray().length);

    this.allVolumes[0].getFieldsArray().forEach((element, index) => {
      if (this.isBook()) {
        let holdingsBook: HoldingsBook = {
          VOL: element.filter(field => field.getKey() == FieldName.VOL)[0].getFormControl().value,
          CLN: element.filter(field => field.getKey() == FieldName.CLN)[0].getFormControl().value,
          RGTN: element.filter(field => field.getKey() == FieldName.RGTN)[0].getFormControl().value,
          CPYR: element.filter(field => field.getKey() == FieldName.CPYR)[0].getFormControl().value,
          CPYNT: element.filter(field => field.getKey() == FieldName.CPYNT)[0].getFormControl().value,
          LDF: element.filter(field => field.getKey() == FieldName.LDF)[0].getFormControl().value
        };
        this.holding.nacsisHoldingsList[index] = holdingsBook;
      } else {
        let holdingsSerial: HoldingsSerial = {
          HLYR: element.filter(field => field.getKey() == FieldName.HLYR)[0].getFormControl().value,
          HLV: element.filter(field => field.getKey() == FieldName.HLV)[0].getFormControl().value,
          CONT: element.filter(field => field.getKey() == FieldName.CONT)[0].getFormControl().value,
          CLN: element.filter(field => field.getKey() == FieldName.CLN)[0].getFormControl().value,
          LDF: element.filter(field => field.getKey() == FieldName.LDF)[0].getFormControl().value,
          CPYNT: element.filter(field => field.getKey() == FieldName.CPYNT)[0].getFormControl().value
        };
        this.holding.nacsisHoldingsList[index] = holdingsSerial;
      }
    });
    
    let ltrFirstValue = this.ltrList[0]?.getFieldsArray()[0][0]?.getFormControl().value;
    let hasChanged: boolean = !this.nacsis.isEmpty(this.holding.ltrList[0]) && this.nacsis.isEmpty(ltrFirstValue);
    if(!this.nacsis.isEmpty(ltrFirstValue) || hasChanged) {
      this.holding.ltrList = new Array<string>();
      this.ltrList[0]?.getFieldsArray()?.forEach(ltrFieldArr => {
        let ltrValue = ltrFieldArr[0].getFormControl().value;
        if(!this.nacsis.isEmpty(ltrValue)) {
          this.holding.ltrList.push(ltrValue);
        }
      })
    }
    
    try {

      this.nacsis.saveHoldingToNacsis(this.mmsId, this.holding)
      .subscribe({
        next: (header) => {
          console.log(header);
          if (header.status === this.nacsis.OkStatus) {
            this.alert.success(this.translate.instant('Holdings.Form.Success'), {keepAfterRouteChange:true});  
            this.holdingId = header.holdingId;
            this.holding.ID = header.holdingId;
            this.nacsis.saveHolding(this.holding);
            this.router.navigate(['/holdings', this.mmsId, this.mmsTitle]);
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
      this.alert.error(this.translate.instant('General.Errors.generalError'), {keepAfterRouteChange:true});  
    } 
  }

  cancel() {
    // restore holding to origin state
    this.holding.LOC = this.originLOC;
    this.router.navigate(['/holdings', this.mmsId, this.mmsTitle]);
  }

  isBook(): boolean {
    return this.type === this.book;
  }

  getResultActionList() {
    const isEditable = true;//this.record.isEditable;
    return this.ACTIONS_MENU_LIST.filter(
      action  => action.avliableForAll || isEditable);
  }

  initLocationsListFromCodeTable() {
    return ["@", "a"];
  }

  initVolumeForm(isNew: boolean, holdingVol?) {
    if(this.isBook()) {
      return new Array(
        new SearchField(FieldName.VOL, FieldSize.small, this.getVolValue(isNew, holdingVol), this.isReadOnly),
        new SearchField(FieldName.CLN, FieldSize.small, isNew ? '' : holdingVol.CLN, this.isReadOnly),
        new SearchField(FieldName.RGTN, FieldSize.small, isNew ? '' : holdingVol.RGTN, this.isReadOnly),
        new SearchField(FieldName.CPYR, FieldSize.small, isNew ? '' : holdingVol.CPYR, this.isReadOnly),
        new SearchField(FieldName.CPYNT, FieldSize.large, isNew ? '' : holdingVol.CPYNT, this.isReadOnly),
        new SearchField(FieldName.LDF, FieldSize.large, isNew ? '' : holdingVol.LDF, this.isReadOnly)
      );
    } else {
      return new Array(
        new SearchField(FieldName.HLYR, FieldSize.small, isNew ? '' : holdingVol.HLYR, this.isReadOnly, true),
        new SearchField(FieldName.HLV, FieldSize.small, isNew ? '' : holdingVol.HLV, this.isReadOnly, true),
        new SearchField(FieldName.CONT, FieldSize.small, isNew ? '' : holdingVol.CONT, this.isReadOnly),
        new SearchField(FieldName.CLN, FieldSize.small, isNew ? '' : holdingVol.CLN, this.isReadOnly),
        new SearchField(FieldName.CPYNT, FieldSize.large, isNew ? '' : holdingVol.CPYNT, this.isReadOnly),
        new SearchField(FieldName.LDF, FieldSize.large, isNew ? '' : holdingVol.LDF, this.isReadOnly)
      );
    }
  }

  getVolValue(isNew: boolean, holdingVol?): string {
    if(isNew && holdingVol) {
      return holdingVol;
    } else if(!isNew) {
      return holdingVol.VOL;
    }
    return '';
  }

  initLtrForm(ltrList?: string[]) {
    let ltrSearchFieldArr = new Array<Array<SearchField>>();
    if(!this.isReadOnly && this.nacsis.isEmpty(ltrList)) {
      ltrSearchFieldArr.push(new Array(new SearchField(FieldName.LTR, FieldSize.fullWidth, null, this.isReadOnly)));
    } else {
      ltrList?.forEach(ltrValue => {
        ltrSearchFieldArr.push(new Array(new SearchField(FieldName.LTR, FieldSize.fullWidth, ltrValue, this.isReadOnly)));
      });
    }
    return ltrSearchFieldArr;
  }
}
