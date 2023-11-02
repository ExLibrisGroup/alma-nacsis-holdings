import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';
import { ROUTING_STATE_KEY, AppRoutingState, SELECTED_INTEGRATION_PROFILE } from '../service/base.service';
import { concat, of } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { AlmaApiService, IntegrationProfile } from '../service/alma.api.service';
import { mergeMap } from 'rxjs/operators';
import { MembersService } from '../service/members.service';
import { FieldName } from '../user-controls/search-form/search-form-utils';
import { off } from 'process';


@Component({
    selector: 'app-main-menu',
    templateUrl: './main-menu.component.html',
    styleUrls: ['./main-menu.component.scss']
  })

  export class MainMenuComponent implements OnInit {

    @Output() selectionChange: EventEmitter< MatSelectChange >

    menu : Array<{title:string, text:string, icon:string, link:string}>;

    public rsLibrariesNameList;
    private integrationProfilesMap : Map<String,IntegrationProfile>;
    public obs;
    public selected;

    constructor(    
        private membersService: MembersService,    
        private storeService: CloudAppStoreService,
        private almaService: AlmaApiService 
    ) { }

    ngOnInit() {
        let selectedProfile;
        this.almaService.getAllIntegrationProfiles().pipe(
            mergeMap(integrationProfiles => {
                this.integrationProfilesMap = integrationProfiles;
                this.rsLibrariesNameList = Array.from(integrationProfiles.keys());
                this.selected = this.rsLibrariesNameList[0];
                this.menu = this.initMenu();
                return this.storeService.set(SELECTED_INTEGRATION_PROFILE, JSON.stringify(this.integrationProfilesMap.get(this.selected)));
            }),
            mergeMap(profile => {
                selectedProfile = JSON.parse(profile.value)
                let queryParams = FieldName.ID + "=" + selectedProfile.libraryID;
                return this.membersService.getSearchResultsFromNacsis(queryParams);

            }),
            mergeMap(response => {
              if (response.status === this.membersService.OkStatus) {
                selectedProfile.location = response.records[0].LOC;
              }
            return this.storeService.set(SELECTED_INTEGRATION_PROFILE, JSON.stringify(selectedProfile));
            })
        ).subscribe();
        //Clear the store
        concat(
            this.storeService.remove(AppRoutingState.MainMenuPage),
        ).subscribe();
        this.storeService.set(ROUTING_STATE_KEY, AppRoutingState.MainMenuPage).subscribe();
     }
    
    initMenu(): Array<{title:string, text:string, icon:string, link:string}>{
        return new Array(
            {
                title:  'MainMenu.Holdings.Title',
                text:   'MainMenu.Holdings.Text',
                icon:   'uxf-icon uxf-link',
                link:   'holdings'
            },
            {
                title:  'MainMenu.Catalog.Title',
                text:   'MainMenu.Catalog.Text',
                icon:   'uxf-icon uxf-background-color',
                link:   'catalog'
            },
            {
                title:  'MainMenu.Members.Title',
                text:   'MainMenu.Members.Text',
                icon:   'uxf-icon uxf-switch',
                link:   'members'
            },
            {
                title:  'MainMenu.ILL.Title',
                text:   'MainMenu.ILL.Text',
                icon:   'uxf-icon uxf-external-link',
                link:   'ILL'
            },
            );
    }

    selectProfile(event) {
        let selectedProfile;
        of(JSON.stringify(this.integrationProfilesMap.get(event.value))).pipe(
             mergeMap(profile => {
                selectedProfile = JSON.parse(profile)
                let queryParams = FieldName.ID + "=" + selectedProfile.libraryID;
                return this.membersService.getSearchResultsFromNacsis(queryParams);

            }),
            mergeMap(response => {
              if (response.status === this.membersService.OkStatus) {
                selectedProfile.location = response.records[0].LOC;
              }
            return this.storeService.set(SELECTED_INTEGRATION_PROFILE, JSON.stringify(selectedProfile));
            })
        ).subscribe();
        //this.storeService.set(SELECTED_INTEGRATION_PROFILE, JSON.stringify(this.integrationProfilesMap.get(event.value)));
    }
  }