import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DisplayHoldingResult } from '../../service/holdings.service';
import { MembersService } from '../../service/members.service';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NacsisCatalogResults, IDisplayLines } from '../../catalog/results-types/results-common'
import { SearchType, SearchField, FieldSize, FieldName, SelectSearchField, SelectedSearchFieldValues, MultiSearchField } from '../../user-controls/search-form/search-form-utils';
import { FullViewLink } from '../../user-controls/full-view-display/full-view-display.component';
import { PageEvent } from '@angular/material/paginator';
import { AlmaApiService } from '../../service/alma.api.service';
import { mergeMap } from 'rxjs/operators';
import { MemberSummaryDisplay } from '../../catalog/results-types/member';
import { RecordSelection } from '../../user-controls/result-card/result-card.component';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MEMBER_RECORD, ROUTING_STATE_KEY } from '../../service/base.service';





@Component({
  selector: 'edit-form',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditFormComponent implements OnInit {

    //basic variable
    // private owners: any[];
    private loading : boolean = false;
    // private isRightTableOpen: boolean = false;
    // private members: DisplayHoldingResult[];
    private selectedValues = new SelectedSearchFieldValues();
    // private fieldsMap : Map<FieldName ,SearchField> =  new Map();
    private editFieldsMap : Map<FieldName ,SearchField> =  new Map();
    // private catalogResultsData: NacsisCatalogResults;
    // private resultsSummaryDisplay: Array<IDisplayLines>;
    // private resultFullDisplay;
    // private resultFullLinkDisplay;
    private panelState: boolean = true;
    private numOfResults: number;
    // private pageIndex: number = 0;
    // private pageSize: number = 20;
    // private enableEdit: boolean = true;
    // private enableDelete: boolean = false;
    selected: string;
    isAllRetrieved: boolean = false;
    private fanoId : string;
    private record : IDisplayLines;
    backSession;//: AppRoutingState;

    // @Input() formFields: Array<SearchField>;

  
    /*Initialize all the search values of members search form*/ 
    private initEditFieldsMap(record) : void {
      this.editFieldsMap.set(FieldName.ID , new SearchField(FieldName.ID, FieldSize.medium, record.fullRecord.fullView.ID, true)); 
      this.editFieldsMap.set(FieldName.NAME , new SearchField(FieldName.NAME, FieldSize.medium, record.fullRecord.fullView.NAME, true));
      this.editFieldsMap.set(FieldName.LOC, new SearchField(FieldName.LOC, FieldSize.medium, record.fullRecord.fullView.LOC, true));
      this.editFieldsMap.set(FieldName.KENCODE, new SearchField(FieldName.KENCODE, FieldSize.medium, record.fullRecord.fullView.KENCODE, true)); 
      this.editFieldsMap.set(FieldName.SETCODE , new SearchField(FieldName.SETCODE, FieldSize.medium, record.fullRecord.fullView.SETCODE, true));
      this.editFieldsMap.set(FieldName.ORGCODE, new SearchField(FieldName.ORGCODE, FieldSize.medium, record.fullRecord.fullView.ORGCODE, true));
      this.editFieldsMap.set(FieldName.GRPCODE, new SearchField(FieldName.GRPCODE, FieldSize.medium, record.fullRecord.fullView.GRPCODE, true));
      this.editFieldsMap.set(FieldName.CATFLG, new SearchField(FieldName.CATFLG, FieldSize.medium, record.fullRecord.fullView.CATFLG, true));
      this.editFieldsMap.set(FieldName.ILLFLG, new SearchField(FieldName.ILLFLG, FieldSize.medium, record.fullRecord.fullView.ILLFLG, true));
      this.editFieldsMap.set(FieldName.STAT, new SelectSearchField( this.selectedValues.getServiceStatusList(), FieldName.STAT, FieldSize.medium, record.fullRecord.fullView.STAT));
      this.editFieldsMap.set(FieldName.COPYS, new SelectSearchField( this.selectedValues.getCopyServiceTypeList(), FieldName.COPYS, FieldSize.medium, record.fullRecord.fullView.COPYS));
      this.editFieldsMap.set(FieldName.LOANS, new SelectSearchField( this.selectedValues.getLendingServiceTypeList(), FieldName.LOANS, FieldSize.medium, record.fullRecord.fullView.LOANS));
      this.editFieldsMap.set(FieldName.FAXS, new SelectSearchField( this.selectedValues.getFAXServiceTypeList(), FieldName.FAXS, FieldSize.medium, record.fullRecord.fullView.FAXS));
      this.editFieldsMap.set(FieldName.CATTEL, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.CATTEL, FieldSize.medium, record.fullRecord.fullView.EMAIL)));
      this.editFieldsMap.set(FieldName.CATDEPT, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.CATDEPT, FieldSize.medium, record.fullRecord.fullView.POLICY)));
      this.editFieldsMap.set(FieldName.CATFAX, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.CATFAX, FieldSize.medium, record.fullRecord.fullView.EMAIL)));
      this.editFieldsMap.set(FieldName.SYSDEPT, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.SYSDEPT, FieldSize.medium, record.fullRecord.fullView.POLICY)));
      this.editFieldsMap.set(FieldName.SYSTEL, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.SYSTEL, FieldSize.medium, record.fullRecord.fullView.EMAIL)));
      this.editFieldsMap.set(FieldName.SYSFAX, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.SYSFAX, FieldSize.medium, record.fullRecord.fullView.POLICY)));
      this.editFieldsMap.set(FieldName.EMAIL, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.EMAIL, FieldSize.medium, record.fullRecord.fullView.EMAIL)));
      this.editFieldsMap.set(FieldName.POLICY, new MultiSearchField(this.createSearchFieldListbyFormControlValues(FieldName.POLICY, FieldSize.medium, record.fullRecord.fullView.POLICY)));
    }
  
    /*Get list of all search value, calling this function from the DOM*/
    public getEditFieldsList() : Array<SearchField> {
      return Array.from(this.editFieldsMap.values());
    } 
    
    createSearchFieldListbyFormControlValues(key : FieldName, fieldSize : FieldSize, formControlValues) {
      let searchFieldsArrary = new Array();
      formControlValues?.forEach(element => {
        searchFieldsArrary.push( new Array(new SearchField(key, FieldSize.medium, element)));
      });
      return searchFieldsArrary;
    }
  
    constructor(
      private translate: TranslateService,
      private alert: AlertService,
      protected almaApiService: AlmaApiService,
      private location : Location,
      private route: ActivatedRoute,  
      
    ) {
     
    }
  
    ngOnInit() {
      this.backSession = sessionStorage.getItem(ROUTING_STATE_KEY);
      this.record = JSON.parse(sessionStorage.getItem(MEMBER_RECORD));
      this.initEditFieldsMap(this.record);
    }
  
    panelOpenState() {
      this.panelState = true;
    }
  
    panelCloseState() {
      this.panelState = false;
    }
  
    
    getFanoId() {
  
      this.almaApiService.getIntegrationProfile()
        .subscribe( {
          next : integrationProfile => {
            this.fanoId =  integrationProfile.libraryID;
            },
            error: e => {
                this.loading = false;
                console.log(e.message);
                this.alert.error(this.translate.instant('General.Errors.generalError'), {keepAfterRouteChange:true});     
              }
          });
  }
  

    resultExists() {
      this.numOfResults > 0;
    }
  }
  
  