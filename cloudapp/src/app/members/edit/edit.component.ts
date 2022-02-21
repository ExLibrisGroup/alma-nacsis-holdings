import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { IDisplayLines } from '../../catalog/results-types/results-common'
import { SearchField, FieldSize, FieldName, SelectSearchField, SelectedSearchFieldValues, MultiSearchField } from '../../user-controls/search-form/search-form-utils';
import { AlmaApiService } from '../../service/alma.api.service';
import { MEMBER_RECORD, ROUTING_STATE_KEY } from '../../service/base.service';
import { MemberUpdate } from '../../catalog/results-types/member';
import { MembersService } from '../../service/members.service';

@Component({
  selector: 'edit-form',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditFormComponent implements OnInit {

  //basic variable
  private selectedValues = new SelectedSearchFieldValues();
  private numOfResults: number;
  selected: string;
  isAllRetrieved: boolean = false;
  //private fanoId : string;
  backSession;//: AppRoutingState;

  // UI variables
  panelState: boolean = true;
  private loading: boolean = false;

   // Data variables
   private member: MemberUpdate;
   private record: IDisplayLines;

   //Save variables
  private editFieldsMap: Map<FieldName, SearchField> = new Map();

  /*Initialize all the search values of members search form*/
  private initEditFieldsMap(record): void {
    this.editFieldsMap.set(FieldName.ID, new SearchField(FieldName.ID, FieldSize.medium, record.fullRecord.fullView.ID, true));
    this.editFieldsMap.set(FieldName.NAME, new SearchField(FieldName.NAME, FieldSize.medium, record.fullRecord.fullView.NAME, true));
    this.editFieldsMap.set(FieldName.KENCODE, new SearchField(FieldName.KENCODE, FieldSize.medium, record.fullRecord.fullView.KENCODE, true));
    this.editFieldsMap.set(FieldName.SETCODE, new SearchField(FieldName.SETCODE, FieldSize.medium, record.fullRecord.fullView.SETCODE, true));
    this.editFieldsMap.set(FieldName.ORGCODE, new SearchField(FieldName.ORGCODE, FieldSize.medium, record.fullRecord.fullView.ORGCODE, true));
    this.editFieldsMap.set(FieldName.GRPCODE, new SearchField(FieldName.GRPCODE, FieldSize.medium, record.fullRecord.fullView.GRPCODE, true));
    this.editFieldsMap.set(FieldName.CATFLG, new SearchField(FieldName.CATFLG, FieldSize.medium, record.fullRecord.fullView.CATFLG, true));
    this.editFieldsMap.set(FieldName.ILLFLG, new SearchField(FieldName.ILLFLG, FieldSize.medium, record.fullRecord.fullView.ILLFLG, true));
    this.editFieldsMap.set(FieldName.STAT, new SelectSearchField(this.selectedValues.getServiceStatusList(), FieldName.STAT, FieldSize.medium, record.fullRecord.fullView.STAT));
    this.editFieldsMap.set(FieldName.COPYS, new SelectSearchField(this.selectedValues.getCopyServiceTypeList(), FieldName.COPYS, FieldSize.medium, record.fullRecord.fullView.COPYS));
    this.editFieldsMap.set(FieldName.LOANS, new SelectSearchField(this.selectedValues.getLendingServiceTypeList(), FieldName.LOANS, FieldSize.medium, record.fullRecord.fullView.LOANS));
    this.editFieldsMap.set(FieldName.FAXS, new SelectSearchField(this.selectedValues.getFAXServiceTypeList(), FieldName.FAXS, FieldSize.medium, record.fullRecord.fullView.FAXS));
    this.editFieldsMap.set(FieldName.TEL, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.TEL, FieldSize.medium, record.fullRecord.fullView.TEL), 1));
    this.editFieldsMap.set(FieldName.FAX, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.FAX, FieldSize.medium, record.fullRecord.fullView.FAX), 1));
    this.editFieldsMap.set(FieldName.CATTEL, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.CATTEL, FieldSize.medium, record.fullRecord.fullView.CATTEL), 1));
    this.editFieldsMap.set(FieldName.CATDEPT, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.CATDEPT, FieldSize.medium, record.fullRecord.fullView.CATDEPT), 1));
    this.editFieldsMap.set(FieldName.CATFAX, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.CATFAX, FieldSize.medium, record.fullRecord.fullView.CATFAX), 1));
    this.editFieldsMap.set(FieldName.SYSDEPT, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.SYSDEPT, FieldSize.medium, record.fullRecord.fullView.SYSDEPT), 1));
    this.editFieldsMap.set(FieldName.SYSTEL, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.SYSTEL, FieldSize.medium, record.fullRecord.fullView.SYSTEL), 1));
    this.editFieldsMap.set(FieldName.SYSFAX, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.SYSFAX, FieldSize.medium, record.fullRecord.fullView.SYSFAX), 1));
    this.editFieldsMap.set(FieldName.EMAIL, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.EMAIL, FieldSize.medium, record.fullRecord.fullView.EMAIL), 1));
    this.editFieldsMap.set(FieldName.POLICY, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.POLICY, FieldSize.medium, record.fullRecord.fullView.POLICY), 1));
    this.editFieldsMap.set(FieldName.LOC, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.LOC, FieldSize.medium, record.fullRecord.fullView.LOC, true), 1));

  }

  /* Get list of all search value, calling this function from the DOM */
  public getEditFieldsList(): Array<SearchField> {
    return Array.from(this.editFieldsMap.values());
  }

  private createSearchFieldListbyFormControlValues(key: FieldName, fieldSize: FieldSize, formControlValues, readOnly? : boolean): any[] {
    let searchFieldsArrary = new Array();
    if (formControlValues[0]?.length > 0 && formControlValues[0] !== "null") {
      formControlValues?.forEach(element => {
        searchFieldsArrary.push(new Array(new SearchField(key, FieldSize.medium, element, readOnly)));
      });
    } else {
      searchFieldsArrary.push(new Array(new SearchField(key, FieldSize.medium)));
    }
    return searchFieldsArrary;
  }

  constructor(
    private translate: TranslateService,
    private alert: AlertService,
    protected almaApiService: AlmaApiService,
    private membersService: MembersService,
  ) {}

  ngOnInit() {
    this.backSession = sessionStorage.getItem(ROUTING_STATE_KEY);
    this.record = JSON.parse(sessionStorage.getItem(MEMBER_RECORD));
    this.initEditFieldsMap(this.record);
  }

    /* Methods called from the DOM */
    public panelOpenState() {
      this.panelState = true;
    }
  
    public panelCloseState() {
      this.panelState = false;
    }
  
    public resultExists() {
      this.numOfResults > 0;
    }

  /* Save the record (member) on the server */
  save() {
    this.member = new MemberUpdate();
    this.member.ID = this.editFieldsMap.get(FieldName.ID).formControl.value;
    this.member.COPYS = this.editFieldsMap.get(FieldName.COPYS).formControl.value;
    this.member.LOANS = this.editFieldsMap.get(FieldName.LOANS).formControl.value;
    this.member.FAXS = this.editFieldsMap.get(FieldName.FAXS).formControl.value;
    this.member.STAT = this.editFieldsMap.get(FieldName.STAT).formControl.value;
    this.member.POLICY = this.getFormControlValues(FieldName.POLICY);
    this.member.CATDEPT = this.getFormControlValues(FieldName.CATDEPT);
    this.member.CATTEL = this.getFormControlValues(FieldName.CATTEL);
    this.member.CATFAX = this.getFormControlValues(FieldName.CATFAX);
    this.member.SYSDEPT = this.getFormControlValues(FieldName.SYSDEPT);
    this.member.SYSTEL = this.getFormControlValues(FieldName.SYSTEL);
    this.member.SYSFAX = this.getFormControlValues(FieldName.SYSFAX);
    this.member.EMAIL = this.getFormControlValues(FieldName.EMAIL);
    this.membersService.saveMemberToNacsis(this.member)
      .subscribe({
        next: (updateResponse) => {
          try {
            console.log(updateResponse);
            if (updateResponse.status === this.membersService.OkStatus) {
              this.alert.success(this.translate.instant('Members.Form.Success'), { keepAfterRouteChange: true });
            } else {
              this.alert.error(updateResponse.errorMessage, { keepAfterRouteChange: true });
            }
          } catch (e) {
            this.loading = false;
            console.log(e);
            this.alert.error(this.translate.instant('General.Errors.generalError'), { keepAfterRouteChange: true });
          }
        },
        error: e => {
          this.loading = false;
          console.log(e.message);
          this.alert.error(e.message, { keepAfterRouteChange: true });
        },
        complete: () => this.loading = false
      });
  }

  private getFormControlValues(filedName: FieldName): any[] {
    return (this.editFieldsMap.get(filedName) as MultiSearchField).fieldsArr?.map(element => {
      if (element[0].formControl.value) {
        return element[0].formControl.value;
      }
      return "";
    });;
  }
}

