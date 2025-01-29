import { Component, AfterViewInit , ViewChild, TemplateRef } from '@angular/core';
import { SearchType, SearchField, FieldSize, FieldName, stopWords, danceCharacters, charactersToRemoveForAKEY, delimiters } from '../../user-controls/search-form/search-form-utils';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CatalogService } from '../../service/catalog.service';
import { AlertService, CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

import { NacsisCatalogResults, IDisplayLines } from '../results-types/results-common'
import { AppRoutingState, ROUTING_STATE_KEY, QueryParams } from '../../service/base.service';
import { RecordSelection, Action } from '../../user-controls/result-card/result-card.component';
import { FullViewLink } from '../../user-controls/full-view-display/full-view-display.component';
import { HoldingsService } from '../../service/holdings.service';
import { MembersService } from '../../service/members.service';
import { concat } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
    selector: 'catalog-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
  })

export class CatalogMainComponent implements AfterViewInit {

    public SEARCH_TYPE_ARRAY = new Array (SearchType.Monographs, SearchType.Serials, SearchType.Names, SearchType.UniformTitles);
    public ALL_DATABASES_MAP = new Map([
        [SearchType.Monographs, ['BOOK','PREBOOK','JPMARC','TRCMARC','USMARC','USMARCX','GPOMARC','UKMARC','REMARC','DNMARC','CHMARC','KORMARC','RECON','HBZBKS','SPABKS','ITABKS','KERISB','KERISX','BNFBKS']],
        [SearchType.Serials, ['SERIAL','JPMARCS','USMARCS','SPASER','ITASER','KERISS','BNFSER']],
        [SearchType.Names, ['NAME', 'JPMARCA', 'USMARCA']],
        [SearchType.UniformTitles, ['TITLE', 'USMARCT']],
        [SearchType.Members, ['MEMBER']]
    ]);
    public ALL_SEARCH_FIELDS_MAP = new Map([
        [SearchType.Monographs, this.initMonographsSearchFields()],
        [SearchType.Serials, this.initSerialsSearchFields()], 
        [SearchType.Names, this.initNamesSearchFields()], 
        [SearchType.UniformTitles, this.initUniformTitlesSearchFields()] 
    ]);
    public ACTIONS_MENU_LIST = new Map([
        [SearchType.Monographs, [new Action('Catalog.Results.Actions.View'), new Action('Catalog.Results.Actions.Import')]],
        [SearchType.Serials, [new Action('Catalog.Results.Actions.View'), new Action('Catalog.Results.Actions.Import')]],
        [SearchType.Names, [new Action('Catalog.Results.Actions.View') , new Action('Catalog.Results.Actions.Import')]],
        [SearchType.UniformTitles, [new Action('Catalog.Results.Actions.View'), new Action('Catalog.Results.Actions.Import')]],
    ]);


    // Selection variables
    public currentSearchType: SearchType = SearchType.Monographs;
    currentDatabase: string;// = 'BOOK';  // first default selection (since opened with Monographs)
    linkSearchType: SearchType;
    actionMenuEnteries: Array<Action>;

    // UI variables
    public panelState: boolean = true;
    public loading: boolean = false;
    public isRightTableOpen: boolean = false;
    public isColapsedMode: boolean = true;

    // Search variables
    private catalogResultsData: NacsisCatalogResults;
    public numOfResults: number;
    public pageIndex: number = 0;
    public pageSize: number = 20;

    // Display variables
    public resultsSummaryDisplay: Array<IDisplayLines>;
    public resultFullDisplay;
    public resultFullLinkDisplay;

    // Templates
    @ViewChild('notSearched') notSearchedTmpl:TemplateRef<any>;
    @ViewChild('searchResults') searchResultsTmpl:TemplateRef<any>;
    @ViewChild('noResults') noResultsTmpl:TemplateRef<any>;
    @ViewChild('fullRecord') fullRecordTmpl:TemplateRef<any>;
    public currentResulsTmpl: TemplateRef<any>;


    constructor(
        private catalogService: CatalogService,
        private holdingsService: HoldingsService,
        private membersService : MembersService,
        private router: Router,
        private alert: AlertService,
        private translate: TranslateService,
        private storeService: CloudAppStoreService
    ) { }


    ngAfterViewInit(){
        this.storeService.get(ROUTING_STATE_KEY).subscribe((stateKey)=>{
            if(stateKey == "") {
                this.catalogService.clearAllSearchResults();
            } else {
                this.onBackFromViewHolding();
            }
        });
    }

    
    /***  Search Form Section  ***/

    getSearchTypesLabels(): Array<string>{
        let searchTypeMap = new Array(); 
        this.SEARCH_TYPE_ARRAY.forEach(type=> {
            searchTypeMap.push("Catalog.Form.SearchTypes." + type)
        });
        return searchTypeMap;
    }

    getSearchTypeIndex(): number {
        return this.SEARCH_TYPE_ARRAY.indexOf(this.currentSearchType);
    }
    
    getCurrentDatabases(): Array<string> {
        return this.ALL_DATABASES_MAP.get(this.currentSearchType);
    }

    setCurrentDatabase(db: string) {
        this.currentDatabase = db;
    }

    getPrimaryDatabase(searchType: SearchType) {
        return this.ALL_DATABASES_MAP.get(searchType)[0];
    }

    getSearchFields(): Array<SearchField> {
        return this.ALL_SEARCH_FIELDS_MAP.get(this.currentSearchType);
    }

    clear() {
           this.ALL_SEARCH_FIELDS_MAP.forEach(searchType => {
            searchType.forEach(searchField => {
                searchField.getFormControl().setValue(null)
            }); 
           });      
    }

    panelOpenState() {
        this.panelState = true;
    }

    panelCloseState() {
        this.panelState = false;
    }

    onTabChange(event: MatTabChangeEvent){
        this.currentSearchType =  this.SEARCH_TYPE_ARRAY[event.index];
        this.currentDatabase = this.getCurrentDatabases()[0];
        if(this.catalogService.getSearchResults(this.currentSearchType).getResults() != null){
            this.setSearchResultsDisplay();
        } else {
            this.currentResulsTmpl = this.notSearchedTmpl;
            this.panelState = true;
        }
        this.isRightTableOpen = false;
    } 
    
    removeSpecialCharacters(SearchType: SearchType, fieldsToHandle :string[] ,charectersToRemove:RegExp ,valuesMap:Map<any,any>) {
        let valuableField = this.ALL_SEARCH_FIELDS_MAP.get(this.currentSearchType).filter(field => (fieldsToHandle.includes(field.getKey())) && (field.getFormControl().value != null) && (field.getFormControl().value != ""));
        valuableField.forEach(field => {
            let afterRemoval = field.getFormControl().value.replace(charectersToRemove, '  ');
            // field.getFormControl().setValue(afterRemoval);
            valuesMap.set(field,afterRemoval);
        })
    }
    search() {
        // Generating the URL by the fields' Form Control
        let urlParams = "";
        
        //Defining the fields from which we will remove the stop-words:
        const fieldsToRemoveStopWords = [FieldName.PTBL];
        const fieldsToRemoveAllDanceChars=[FieldName.AKEY];
        const fieldsToRemoveDelimiters=[FieldName.FTITLE];

       
     //remove special charecters and stop words
        
        let valuableFields = this.ALL_SEARCH_FIELDS_MAP.get(this.currentSearchType).filter(field => (field.getFormControl().value != null) && (field.getFormControl().value != ""));
        let valuableFeildsNames=valuableFields.map(field => field.getKey());
        let stopWordsRegex = new RegExp(stopWords.join("\\b|\\b"), 'gi');
        let searchValuesMap=new Map();
        valuableFields.forEach(field=>{
            let value=field.getFormControl().value;
            searchValuesMap.set(field,value);
        })

        this.removeSpecialCharacters(this.currentSearchType, fieldsToRemoveStopWords,stopWordsRegex ,searchValuesMap);  
        this.removeSpecialCharacters(this.currentSearchType,valuableFeildsNames,danceCharacters,searchValuesMap);
        this.removeSpecialCharacters(this.currentSearchType,fieldsToRemoveAllDanceChars,charactersToRemoveForAKEY,searchValuesMap);
        this.removeSpecialCharacters(this.currentSearchType,fieldsToRemoveDelimiters,delimiters,searchValuesMap);
      
        if (valuableFields.length > 0){       

            urlParams = urlParams + QueryParams.PageIndex + "=0&" + QueryParams.PageSize + "=20";
            urlParams = urlParams + "&" + QueryParams.SearchType + "=" + this.currentSearchType;
            urlParams =  urlParams + "&" + QueryParams.Databases + "=" + this.currentDatabase;
            
            valuableFields.forEach(field => {
                    urlParams =  urlParams + "&" + field.getKey();
                    urlParams =  urlParams + "=" + searchValuesMap.get(field).replace(this.catalogService.punctuationRegex, '');
            });
            this.getSearchResultsFromNacsis(urlParams);
        } else {
           return;
        }
    } 
    
    // Calling Nacsis servlet
    getSearchResultsFromNacsis(urlParams:string) {
        this.loading = true;
        try{
            this.catalogService.getSearchResultsFromNacsis(urlParams)
            .subscribe({
                next: (catalogResults) => {
                    if (catalogResults.status === this.catalogService.OkStatus) {
                        if (catalogResults.totalRecords >= 1) {
                            this.catalogService.setSearchResultsMap(this.currentSearchType, catalogResults, urlParams);
                            this.setPageIndexAndSize(urlParams);
                            this.setSearchResultsDisplay();
                        } else {
                            this.panelState = false;
                            this.numOfResults = 0;
                            this.resultsTemplateFactory();
                        }
                    } else {
                        this.alert.error(catalogResults.errorMessage, {keepAfterRouteChange:true}); 
                    } },
                error: e => {
                    this.loading = false;
                    console.log(e);
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

    resultsTemplateFactory() {
        if(this.numOfResults > 0){
            this.currentResulsTmpl = this.searchResultsTmpl;
        } else if(this.numOfResults == 0 || this.numOfResults == null) {
            this.currentResulsTmpl = this.noResultsTmpl;
        } else {
            this.currentResulsTmpl = this.notSearchedTmpl;
        }
    }


    /***  Summary View Section  ***/

    getActionMenu() {
        let searchedDBName =  this.getParamsFromSearchQuery(this.currentSearchType).get(QueryParams.Databases);
        // For searches inside BOOK or SERIAL DB, return the full option
        if (searchedDBName === "BOOK" || searchedDBName === "SERIAL") {
            let additionalMenu = [...this.ACTIONS_MENU_LIST.get(this.currentSearchType)];
            additionalMenu.push(new Action('Catalog.Results.Actions.ViewHoldings'));
            return additionalMenu;
        } else {
            return this.ACTIONS_MENU_LIST.get(this.currentSearchType);
        }
    }

    private setSearchResultsDisplay(){
        this.catalogResultsData = this.catalogService.getSearchResults(this.currentSearchType);
        this.numOfResults = this.catalogResultsData.getHeader().totalRecords;
        this.actionMenuEnteries = new Array();
        this.actionMenuEnteries = this.getActionMenu();
        this.resultsSummaryDisplay = new Array();
        this.catalogResultsData.getResults()?.forEach(result=>{
            this.resultsSummaryDisplay.push(result.getSummaryDisplay());
        });    
        this.panelState = false;
        this.resultsTemplateFactory();
    }

    onActionsClick(selection: RecordSelection) {
        let record = this.resultsSummaryDisplay[selection.recordIndex];
        switch (selection.actionIndex) {
            case 0: // Full view
                this.currentResulsTmpl = this.fullRecordTmpl;
                this.resultFullDisplay = record.getFullRecordData().getFullViewDisplay().initContentDisplay();
                break;
            case 1: // Import the record
                this.onImportRecord(record.getFullRecordData().getRawData());
                break;
            case 2: // View Holdings
                this.onViewHoldings(record.getFullRecordData().getID(), record.initTitleDisplay().toStringLine());
                break;
            default: {
                this.currentResulsTmpl = this.noResultsTmpl;
            }
        }
        
    }
    
    onTitleClick(recordIndex: number) {
        // Clicking on title will open the full view 
        let record = this.resultsSummaryDisplay[recordIndex];
        this.currentResulsTmpl = this.fullRecordTmpl;
        this.resultFullDisplay = record.getFullRecordData().getFullViewDisplay().initContentDisplay();
    }


    /***  Full View Section   ***/

    onBackFromFullView() {
        this.currentResulsTmpl = this.searchResultsTmpl;
        this.isRightTableOpen = false;
    }

    getCatalogResults(urlParams : string) {
        this.catalogService.getSearchResultsFromNacsis(urlParams)
        .subscribe({
            next: (catalogResults) => {
                if (catalogResults.status === this.catalogService.OkStatus) {
                    if (catalogResults.totalRecords == 1) {
                        let baseResult = this.catalogService.resultsTypeFactory(this.linkSearchType, catalogResults.records[0]);
                        this.resultFullLinkDisplay = baseResult.getFullViewDisplay().initContentDisplay();
                        this.isRightTableOpen = true;
                    } else {
                        this.resultFullLinkDisplay == null;
                        this.isRightTableOpen = true;
                    }
                } else {
                    this.alert.error(catalogResults.errorMessage, {keepAfterRouteChange:true});  
                } },
            error: e => {
                this.loading = false;
                console.log(e.message);
                this.alert.error(e.message, {keepAfterRouteChange:true});
            },
            complete: () => this.loading = false
        });
    }

    getMemberResult(urlParams : string) {
        this.membersService.getSearchResultsFromNacsis(urlParams)
        .subscribe({
            next: (catalogResults) => {
                if (catalogResults.status === this.membersService.OkStatus) {
                  if (catalogResults.totalRecords == 1) {
                    let baseResult = this.membersService.resultsTypeFactory(SearchType.Members, catalogResults.records[0]);
                    this.resultFullLinkDisplay = baseResult.getFullViewDisplay().initContentDisplay();
                    this.isRightTableOpen = true;
                  } else {
                      this.resultFullLinkDisplay == null;
                      this.isRightTableOpen = false;
                  }
                } else {
                    this.alert.error(catalogResults.errorMessage, {keepAfterRouteChange:true});  
                } },
            error: e => {
                this.loading = false;
                console.log(e.message);
                this.alert.error(e.message, {keepAfterRouteChange:true});
            },
            complete: () => this.loading = false
        });
    }
    
    onFullViewInternalLinkClick(fullViewLink: FullViewLink) {
        this.linkSearchType = fullViewLink.searchType;
        let urlParams = QueryParams.PageIndex + "=0&" + QueryParams.PageSize + "=20";
        urlParams = urlParams + "&" + QueryParams.SearchType + "=" + fullViewLink.searchType;
        urlParams =  urlParams + "&" + QueryParams.Databases + "=" + this.getPrimaryDatabase(fullViewLink.searchType);
        urlParams =  urlParams + "&" + QueryParams.ID + "=" + fullViewLink.linkID;
        
        this.isColapsedMode = (window.innerWidth <= 600) ? true : false;

        this.loading = true;
        try{
            if (fullViewLink.searchType === SearchType.Members) {
                this.getMemberResult(urlParams);
            } else {
                this. getCatalogResults(urlParams);
            }
        } catch (e) {
            this.loading = false;
            console.log(e);
            this.alert.error(this.translate.instant('General.Errors.generalError'), {keepAfterRouteChange:true});      
        }

    }

    onFullViewLinkClose() {
        this.isRightTableOpen = false;
        this.resultFullLinkDisplay = null;
    }

    onResize(event) {
        this.isColapsedMode = (event.target.innerWidth <= 600) ? true : false;
    }
    

    /***   View Holdings   ***/

    onViewHoldings(nacsisId: string, title: string) {
        this.loading = true;
        try {
            this.holdingsService.getHoldingsFromNacsis(nacsisId, "Mine")
            .subscribe({
            next: (header) => {
                if (header.status === this.holdingsService.OkStatus) {
                    concat(
                        this.storeService.set(ROUTING_STATE_KEY ,AppRoutingState.CatalogSearchPage),
                        this.storeService.set(this.holdingsService.OwnerKey, "1")// Set holding owner as "Mine"
                    ).subscribe();
                    this.catalogService.setCurrentSearchType(this.currentSearchType);
                    this.router.navigate(['/holdings', nacsisId, title]);
                } else {
                    this.alert.error(header.errorMessage, {keepAfterRouteChange:true});  
                }
            },
            error: e => {
                this.loading = false;
                console.log(e);
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

    onBackFromViewHolding() {
        this.searchFormRefill();
        this.setSearchResultsDisplay();
    }

    /***   Import   ***/

    onImportRecord(rawData: string) {
        this.loading = true;
        try {
            this.catalogService.importRecordToAlma(this.currentSearchType, rawData).subscribe({
                next: (importedRecord) => {
                    let mmsId: string;
                    if (!this.catalogService.isEmpty(importedRecord.link)) {
                     mmsId = importedRecord.link.split("/").pop(); 
                    } else {
                        mmsId = importedRecord.mms_id;
                    }
                    this.alert.success(this.translate.instant('Catalog.Results.ImportSucceeded') + " (" + mmsId + ")", {autoClose: false, keepAfterRouteChange:true});  
                },
                error: e => {
                    this.loading = false;
                    console.log(e);
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


    /***   Pagination    ***/
    
    setPageIndexAndSize(urlParams: string) {
        let pageIndexParam = QueryParams.PageIndex + "=";
        let pageSizeParam = "&" + QueryParams.PageSize + "=";
        let searchTypeParam = "&" + QueryParams.SearchType;
        this.pageIndex = Number(urlParams.split(pageIndexParam).pop().split(pageSizeParam)[0]);
        this.pageSize = Number(urlParams.split(pageSizeParam).pop().split(searchTypeParam)[0]);
    }

    onPageAction(pageEvent: PageEvent) {
        let urlParams = this.catalogService.getQueryParams(this.currentSearchType);
        let newIndexStr = QueryParams.PageIndex + "=" + pageEvent.pageIndex + "&" + QueryParams.PageSize;
        urlParams = urlParams.replace(/pageIndex=.*pageSize/, newIndexStr);
        let newSizeStr = QueryParams.PageSize + "=" + pageEvent.pageSize + "&" + QueryParams.SearchType;
        urlParams = urlParams.replace(/pageSize=.*searchType/, newSizeStr);

        this.getSearchResultsFromNacsis(urlParams);
    }


    searchFormRefill() { 
        let paramsMap = this.getParamsFromSearchQuery();
        this.pageIndex = paramsMap.get(QueryParams.PageIndex);
        this.pageSize = paramsMap.get(QueryParams.PageSize);
        this.currentSearchType = SearchType[paramsMap.get(QueryParams.SearchType)];
        this.currentDatabase = paramsMap.get(QueryParams.Databases);
        this.ALL_SEARCH_FIELDS_MAP.get(this.currentSearchType).forEach(field => {
            if(paramsMap.has(field.getKey())){
                field.setFormControl(paramsMap.get(field.getKey()));
            }
        });
    }

    getParamsFromSearchQuery(searchType?: SearchType) {
        let paramsMap = new Map();
        this.catalogService.getQueryParams(searchType).split("&").forEach(param => {
            let paramAsKeyValue = param.split("=");
            paramsMap.set(paramAsKeyValue[0],paramAsKeyValue[1]);
        });
        return paramsMap;
    }

    

    /***  initializing the search fields   ***/

    initMonographsSearchFields(): Array<SearchField> {
        return new Array(new SearchField(FieldName.TITLE, FieldSize.fullWidth), 
            new SearchField(FieldName.FTITLE, FieldSize.fullWidth), 
            new SearchField(FieldName.PTBL, FieldSize.fullWidth), 
            new SearchField(FieldName.AUTH, FieldSize.fullWidth), 
            new SearchField(FieldName.VOL, FieldSize.large), 
            new SearchField(FieldName.AKEY, FieldSize.large), 
            new SearchField(FieldName.PUB, FieldSize.large), 
            new SearchField(FieldName.YEAR, FieldSize.large), 
            new SearchField(FieldName.PLACE, FieldSize.medium), 
            new SearchField(FieldName.CNTRY, FieldSize.medium), 
            new SearchField(FieldName.LANG, FieldSize.medium), 
            new SearchField(FieldName.SH, FieldSize.medium), 
            new SearchField(FieldName.ID, FieldSize.medium), 
            new SearchField(FieldName.PID, FieldSize.medium), 
            new SearchField(FieldName.ISSN, FieldSize.small), 
            new SearchField(FieldName.ISBN, FieldSize.small), 
            new SearchField(FieldName.NBN, FieldSize.small), 
            new SearchField(FieldName.NDLCN, FieldSize.small), 
            new SearchField(FieldName.LCCN, FieldSize.small));
    }

    initSerialsSearchFields(): Array<SearchField> {
        return new Array(new SearchField(FieldName.TITLE, FieldSize.fullWidth), 
            new SearchField(FieldName.FTITLE, FieldSize.fullWidth), 
            new SearchField(FieldName.AUTH, FieldSize.fullWidth), 
            new SearchField(FieldName.ISSN, FieldSize.small), 
            new SearchField(FieldName.CODEN, FieldSize.small), 
            new SearchField(FieldName.NDLPN, FieldSize.small), 
            new SearchField(FieldName.LCCN, FieldSize.small),
            new SearchField(FieldName.PUB, FieldSize.large), 
            new SearchField(FieldName.YEAR, FieldSize.large), 
            new SearchField(FieldName.SH, FieldSize.small),
            new SearchField(FieldName.AKEY, FieldSize.small), 
            new SearchField(FieldName.ID, FieldSize.small), 
            new SearchField(FieldName.FID, FieldSize.small),
            new SearchField(FieldName.PLACE, FieldSize.medium), 
            new SearchField(FieldName.CNTRY, FieldSize.medium), 
            new SearchField(FieldName.LANG, FieldSize.medium));
    }
    initNamesSearchFields(): Array<SearchField> {
        return new Array(new SearchField(FieldName.AUTH, FieldSize.fullWidth), 
            new SearchField(FieldName.ID, FieldSize.large), 
            new SearchField(FieldName.SAID, FieldSize.large),
            new SearchField(FieldName.AKEY, FieldSize.medium), 
            new SearchField(FieldName.PLACEKEY, FieldSize.medium), 
            new SearchField(FieldName.DATE, FieldSize.medium));
    }

    initUniformTitlesSearchFields(): Array<SearchField> {
        return new Array(new SearchField(FieldName.TITLE, FieldSize.fullWidth), 
            new SearchField(FieldName.AUTH, FieldSize.fullWidth), 
            new SearchField(FieldName.AKEY, FieldSize.medium), 
            new SearchField(FieldName.ID, FieldSize.medium), 
            new SearchField(FieldName.SAID, FieldSize.medium));
    }
}
