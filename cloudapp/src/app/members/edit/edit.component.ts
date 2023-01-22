import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertService, CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';
import { IDisplayLines } from '../../catalog/results-types/results-common'
import { SearchField, FieldSize, FieldName, SelectSearchField, SelectedSearchFieldValues, MultiSearchField, SearchType } from '../../user-controls/search-form/search-form-utils';
import { AlmaApiService } from '../../service/alma.api.service';
import { MEMBER_RECORD, ROUTING_STATE_KEY } from '../../service/base.service';
import { MemberUpdate } from '../../catalog/results-types/member';
import { MembersService } from '../../service/members.service';
import { Observable, of, merge } from 'rxjs';
import { mergeMap, catchError, map } from 'rxjs/operators';

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
  loading: boolean = false;

   // Data variables
   private member: MemberUpdate;
   private record: IDisplayLines;

   //Save variables
  private editFieldsMap: Map<FieldName, SearchField> = new Map();
  public editFieldsMapObs : Observable<SearchField[]> = new Observable<SearchField[]>();

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
    this.editFieldsMap.set(FieldName.STAT, new SelectSearchField(this.selectedValues.getServiceStatusList(), false, FieldName.STAT, FieldSize.medium,  record.fullRecord.fullView.STAT));
    this.editFieldsMap.set(FieldName.COPYS, new SelectSearchField(this.selectedValues.getCopyServiceTypeList(), false, FieldName.COPYS, FieldSize.large,   record.fullRecord.fullView.COPYS));
    this.editFieldsMap.set(FieldName.COPYAL, new SearchField(FieldName.COPYAL, FieldSize.large, record.fullRecord.fullView.COPYAL, true, false));
    this.editFieldsMap.set(FieldName.LOANS, new SelectSearchField(this.selectedValues.getLendingServiceTypeList(), false, FieldName.LOANS, FieldSize.large, record.fullRecord.fullView.LOANS));
    this.editFieldsMap.set(FieldName.LOANAL, new SearchField(FieldName.LOANAL, FieldSize.large, record.fullRecord.fullView.LOANAL, true, false));
    this.editFieldsMap.set(FieldName.FAXS, new SelectSearchField(this.selectedValues.getFAXServiceTypeList(), false, FieldName.FAXS, FieldSize.medium,  record.fullRecord.fullView.FAXS));
    this.editFieldsMap.set(FieldName.LOC, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.LOC, FieldSize.medium, record.fullRecord.fullView.LOC, true), 1));
    this.editFieldsMap.set(FieldName.TEL, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.TEL, FieldSize.medium, record.fullRecord.fullView.TEL), 1));
    this.editFieldsMap.set(FieldName.FAX, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.FAX, FieldSize.medium, record.fullRecord.fullView.FAX), 1));
    this.editFieldsMap.set(FieldName.CATDEPT, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.CATDEPT, FieldSize.medium, record.fullRecord.fullView.CATDEPT), 1));
    this.editFieldsMap.set(FieldName.CATTEL, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.CATTEL, FieldSize.medium, record.fullRecord.fullView.CATTEL), 1));
    this.editFieldsMap.set(FieldName.CATFAX, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.CATFAX, FieldSize.medium, record.fullRecord.fullView.CATFAX), 1));
    this.editFieldsMap.set(FieldName.SYSDEPT, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.SYSDEPT, FieldSize.medium, record.fullRecord.fullView.SYSDEPT), 1));
    this.editFieldsMap.set(FieldName.SYSTEL, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.SYSTEL, FieldSize.medium, record.fullRecord.fullView.SYSTEL), 1));
    this.editFieldsMap.set(FieldName.SYSFAX, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.SYSFAX, FieldSize.medium, record.fullRecord.fullView.SYSFAX), 1));
    this.editFieldsMap.set(FieldName.EMAIL, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.EMAIL, FieldSize.medium, record.fullRecord.fullView.EMAIL), 1));
    this.editFieldsMap.set(FieldName.POLICY, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.POLICY, FieldSize.medium, record.fullRecord.fullView.POLICY), 1));
  }

  /* Get list of all search value, calling this function from the DOM */
  public getEditFieldsList() {
    const copysChanges$ = this.editFieldsMap.get(FieldName.COPYS).getFormControl().valueChanges.pipe(map(copysVal => {
      if(copysVal === "C") {
        this.editFieldsMap.get(FieldName.COPYAL).setReadOnly(false);
        this.editFieldsMap.get(FieldName.COPYAL).setRequired(true);
      } else {
        this.editFieldsMap.get(FieldName.COPYAL).setReadOnly(true);
        this.editFieldsMap.get(FieldName.COPYAL).setRequired(false);
        this.editFieldsMap.get(FieldName.COPYAL).getFormControl().setValue(null);
      }
    }));
    const loansChanges$ = this.editFieldsMap.get(FieldName.LOANS).getFormControl().valueChanges.pipe(map(loansVal => {
      if(loansVal === "C") {
        this.editFieldsMap.get(FieldName.LOANAL).setReadOnly(false);
        this.editFieldsMap.get(FieldName.LOANAL).setRequired(true);
      } else {
        this.editFieldsMap.get(FieldName.LOANAL).setReadOnly(true);
        this.editFieldsMap.get(FieldName.LOANAL).setRequired(false);
        this.editFieldsMap.get(FieldName.LOANAL).getFormControl().setValue(null);
      }
    }));

   merge(copysChanges$, loansChanges$)
  .subscribe({
      next: () => {
        return Array.from(this.editFieldsMap.values())
      },
      error : () => {
        console.log("Can't merge $copys and $loans")

      },
      complete : () => {
        return Array.from(this.editFieldsMap.values())
      }
    })
    return Array.from(this.editFieldsMap.values())
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
    private storeService: CloudAppStoreService
  ) {}

  ngOnInit() {
    this.storeService.get(ROUTING_STATE_KEY).subscribe({
      next : (backSession) => {
        this.backSession = backSession;
      },
      error : ()=> {
        console.log("backSession is undefined");
      }
    });
    this.storeService.get(MEMBER_RECORD).subscribe({
      next(memberRecord) {
        this.record = JSON.parse(memberRecord);
        this.initEditFieldsMap(this.record);
      },
      error(err) {
          console.log(err);
      },
    });

   
  }

    /* Methods called from the DOM */
    public panelOpenState() {
      this.panelState = true;
    }
  
    public panelCloseState() {
      this.panelState = false;
    }

  /* Save the record (member) on the server */
  save() {
    this.loading = true;
    this.member = new MemberUpdate();
    this.member.ID = this.editFieldsMap.get(FieldName.ID).formControl.value;
    this.member.COPYS = this.editFieldsMap.get(FieldName.COPYS).formControl.value;
    this.member.LOANS = this.editFieldsMap.get(FieldName.LOANS).formControl.value;
    this.member.COPYAL = this.editFieldsMap.get(FieldName.COPYAL).formControl.value;
    this.member.LOANAL = this.editFieldsMap.get(FieldName.LOANAL).formControl.value;
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
    this.member.FAX = this.getFormControlValues(FieldName.FAX);
    this.member.TEL = this.getFormControlValues(FieldName.TEL);
    this.membersService.saveMemberToNacsis(this.member)
      .subscribe({
        next: (updateResponse) => {
          try {
            console.log(updateResponse);
            if (updateResponse.status === this.membersService.OkStatus) {
              this.alert.success(this.translate.instant('Members.Form.Success'), { keepAfterRouteChange: true });
              this.membersService.setSearchResultsMap(SearchType.Members, updateResponse, "");
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

  private flatControlValue(filedName: FieldName) {
    let val : string = this.editFieldsMap.get(filedName).getFormControl().value.join("|");
    // this.editFieldsMap.get(filedName).getFormControl().value.forEach(element => {
    //   val += element + ",";
    // });
    return val;
  }
}

