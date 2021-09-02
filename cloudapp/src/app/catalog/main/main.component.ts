import { Component, AfterViewInit , ViewChild, TemplateRef } from '@angular/core';
import { SearchField, SearchType, FieldSize, FieldName, QueryParams } from './form-utils';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CatalogService } from '../../service/catalog.service';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

import { NacsisCatalogResults, BaseResult, IDisplayLines } from '../results-types/results-common'
import { MonographSummaryDisplay, MonographFullDisplay } from '../results-types/monographs'
import { SerialSummaryDisplay, SerialFullDisplay } from '../results-types/serials';
import { NameSummaryDisplay, NameFullDisplay } from '../results-types/name';
import { UniformTitleFullDisplay, UniformTitleSummaryDisplay } from '../results-types/uniformTitle';
import { HoldingsService } from '../../service/holdings.service';
import { AppRoutingState, ROUTING_STATE_KEY } from '../../service/base.service';
import { RecordSelection } from '../../user-controls/result-card/result-card.component';
import { FullViewLink } from '../full-view-display/full-view-display.component';



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
        [SearchType.UniformTitles, ['TITLE', 'USMARCT']]
    ]);
    public allFieldsMap = new Map([
        [SearchType.Monographs, [new SearchField(FieldName.TITLE, FieldSize.large), new SearchField(FieldName.FTITLE), new SearchField(FieldName.PTBL), new SearchField(FieldName.VOL), new SearchField(FieldName.TiPtVo), new SearchField(FieldName.AUTH), new SearchField(FieldName.ISSN), new SearchField(FieldName.ISBN), new SearchField(FieldName.NBN), new SearchField(FieldName.NDLCN), new SearchField(FieldName.PUB), new SearchField(FieldName.YEAR), new SearchField(FieldName.PLACE), new SearchField(FieldName.CNTRY), new SearchField(FieldName.LANG), new SearchField(FieldName.SH), new SearchField(FieldName.AKEY), new SearchField(FieldName.ID), new SearchField(FieldName.PID)]],
        [SearchType.Serials, [new SearchField(FieldName.TITLE), new SearchField(FieldName.FTITLE), new SearchField(FieldName.AUTH), new SearchField(FieldName.ISSN), new SearchField(FieldName.CODEN), new SearchField(FieldName.NDLPN), new SearchField(FieldName.PUB), new SearchField(FieldName.YEAR), new SearchField(FieldName.PLACE), new SearchField(FieldName.CNTRY), new SearchField(FieldName.LANG), new SearchField(FieldName.SH), new SearchField(FieldName.AKEY), new SearchField(FieldName.ID), new SearchField(FieldName.FID)]],
        [SearchType.Names, [new SearchField(FieldName.AUTH), new SearchField(FieldName.AKEY), new SearchField(FieldName.PLACE), new SearchField(FieldName.DATE), new SearchField(FieldName.ID), new SearchField(FieldName.SAID)]],
        [SearchType.UniformTitles, [new SearchField(FieldName.TITLE), new SearchField(FieldName.AUTH), new SearchField(FieldName.AKEY), new SearchField(FieldName.ID), new SearchField(FieldName.SAID)]]
    ]);
    private resultActionList: Array<string> = ['Catalog.Results.Actions.View', 'Catalog.Results.Actions.Import', 'Catalog.Results.Actions.ViewHoldings']


    // Selection variables
    public currentSearchType: SearchType = SearchType.Monographs;
    private currentDatabase: string;// = 'BOOK';  // first default selection (since opened with Monographs)
    
    // UI variables
    private panelState: boolean = true;
    private loading: boolean = false;
    private isRightTableOpen: boolean = false;
    private isColapsedMode: boolean = true;

    // Search variables
    private urlParams: string = "";
    private catalogResultsData: NacsisCatalogResults;
    private numOfResults: number;
    private pageIndex: number = 0;
    private pageSize: number = 20;

    // Display variables
    private resultsSummaryDisplay: Array<IDisplayLines>;
    private resultFullDisplay;
    private resultFullLinkDisplay;

    // Templates
    @ViewChild('notSearched') notSearchedTmpl:TemplateRef<any>;
    @ViewChild('searchResults') searchResultsTmpl:TemplateRef<any>;
    @ViewChild('noResults') noResultsTmpl:TemplateRef<any>;
    @ViewChild('fullRecord') fullRecordTmpl:TemplateRef<any>;
    private currentResulsTmpl: TemplateRef<any>;



    constructor(
        private catalogService: CatalogService,
        private holdingsService: HoldingsService,
        private router: Router,
        private alert: AlertService,
        private translate: TranslateService,
    ) { }


    ngAfterViewInit(){
        if(sessionStorage.getItem(ROUTING_STATE_KEY) == "") {
            this.catalogService.clearAllSearchResults();
        } else {
            this.onBackFromViewHolding();
        }
    }

    
    /***  Search Form Section  ***/

    getSearchTypesLabels(): Array<string>{
        let searchTypeMap = new Array(); 
        this.SEARCH_TYPE_ARRAY.forEach(type=> {
            searchTypeMap.push("Catalog.Form.SearchTypes." + type)
        });
        return searchTypeMap;
    }
    
    getCurrentDatabases(): Array<string> {
        return this.ALL_DATABASES_MAP.get(this.currentSearchType);
    }

    setCurrentDatabase(db: string) {
        this.currentDatabase = db;
    }

    getSearchFields(): Array<SearchField> {
        return this.allFieldsMap.get(this.currentSearchType);
    }

    clear() {
        this.allFieldsMap.get(this.currentSearchType).forEach(searchField => {
            searchField.getFormControl().setValue(null)
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

    search() {
        // Generating the URL by the fields' Form Control
        let urlParams = "";
        let valuableFields = this.allFieldsMap.get(this.currentSearchType).filter(field => (field.getFormControl().value != null) && (field.getFormControl().value != ""));
        if (valuableFields.length > 0){
            this.pageIndex = 0;
            this.pageSize = 20;
            urlParams = urlParams + this.generatePageParams();
            urlParams = urlParams + "&" + QueryParams.SearchType + "=" + this.currentSearchType;
            urlParams =  urlParams + "&" + QueryParams.Databases + "=" + this.currentDatabase;
            valuableFields.forEach(field => {
                    urlParams =  urlParams + "&" + field.getKey();
                    urlParams =  urlParams + "=" + field.getFormControl().value;
            });
            this.urlParams = urlParams;
            this.getResultsFromNacsis(urlParams, false);
        } else {
           return;
        }
    } 
    
    // Calling Nacsis servlet
    getResultsFromNacsis(urlParams:string, isFullViewLink: boolean) {
        this.loading = true;
        try{
            this.catalogService.getSearchResultsFromNacsis(urlParams)
            .subscribe({
                next: (catalogResults) => {
                    if (catalogResults.status === this.catalogService.OkStatus) {
                        if(!isFullViewLink) {
                            if (catalogResults.totalRecords >= 1) {
                                this.catalogService.setSearchResultsMap(this.currentSearchType, catalogResults, urlParams)
                                this.setSearchResultsDisplay();
                            } else {
                                this.numOfResults = 0;
                                this.resultsTemplateFactory();
                            }
                        } else {
                            let baseResult = this.catalogService.resultsTypeFactory(this.currentSearchType, catalogResults.records[0]);
                            this.resultFullLinkDisplay = baseResult.getFullViewDisplay().initContentDisplay();
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

    private setSearchResultsDisplay(){
        this.catalogResultsData = this.catalogService.getSearchResults(this.currentSearchType);
        this.numOfResults = this.catalogResultsData.getHeader().totalRecords;
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
    
    onFullViewLink(fullViewLink: FullViewLink) {
        let urlParams = "";
        urlParams = urlParams + QueryParams.PageIndex + "=0&" + QueryParams.PageSize + "=20";
        urlParams = urlParams + "&" + QueryParams.SearchType + "=" + fullViewLink.searchType;
        urlParams =  urlParams + "&" + QueryParams.Databases + "=" + this.ALL_DATABASES_MAP.get(fullViewLink.searchType)[0];
        urlParams =  urlParams + "&" + QueryParams.ID + "=" + fullViewLink.linkID;
        
        this.getResultsFromNacsis(urlParams, true);
        this.isColapsedMode = (window.innerWidth <= 600) ? true : false;

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
                    sessionStorage.setItem(ROUTING_STATE_KEY, AppRoutingState.CatalogSearchPage);
                    this.catalogService.setCurrentSearchType(this.currentSearchType);
                    this.router.navigate(['/holdings', nacsisId, title]);
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

    onBackFromViewHolding() {
        this.searchFormRefill();
        this.setSearchResultsDisplay();
    }

    /***   Import   ***/

    onImportRecord(rawData: string) {
        this.loading = true;
        try {
            this.catalogService.importRecordToAlma(this.currentSearchType, rawData)
            .subscribe({
                next: (importedRecord) => {
                    let mmsIdText = " (" + importedRecord.mms_id + ")";
                    this.alert.success(this.translate.instant('Catalog.Results.ImportSucceeded') + mmsIdText, {autoClose: false, keepAfterRouteChange:true});  
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


    /***   Pagination    ***/
    
    generatePageParams(): string {
        return QueryParams.PageIndex + "=" + this.pageIndex + "&" + QueryParams.PageSize + "=" + this.pageSize;
    }

    onPageAction(pageEvent: PageEvent) {
        this.pageIndex = pageEvent.pageIndex;
        this.pageSize = pageEvent.pageSize;
        let pageParams = this.generatePageParams();
        let nextPagrUrlParams = this.urlParams.replace("pageIndex=0&pageSize=20", pageParams);
        this.getResultsFromNacsis(nextPagrUrlParams, false);
    }


    searchFormRefill() { 
        let paramsMap = new Map();
        this.catalogService.getQueryParams().split("&").forEach(param => {
            let paramAsKeyValue = param.split("=");
            paramsMap.set(paramAsKeyValue[0],paramAsKeyValue[1]);
        });
        this.pageIndex = paramsMap.get(QueryParams.PageIndex);
        this.pageSize = paramsMap.get(QueryParams.PageSize);
        this.currentSearchType = SearchType[paramsMap.get(QueryParams.SearchType)];
        this.currentDatabase = paramsMap.get(QueryParams.Databases);
        this.allFieldsMap.get(this.currentSearchType).forEach(field => {
            if(paramsMap.has(field.getKey())){
                field.setFormControl(paramsMap.get(field.getKey()));
            }
        });
    }

    

}
