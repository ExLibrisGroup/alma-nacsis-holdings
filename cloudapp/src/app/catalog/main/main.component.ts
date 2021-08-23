import { Component, AfterViewInit , ViewChild, TemplateRef } from '@angular/core';
import { SearchField, SearchType, FieldSize, FieldName, QueryParams } from './form-utils';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CatalogService } from '../../service/catalog.service';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

import { IDisplayLinesSummary, NacsisCatalogResults, BaseResult, IDisplayLinesFull } from '../results-types/results-common'
import { MonographSummaryDisplay, MonographFullDisplay } from '../results-types/monographs'
import { SerialSummaryDisplay, SerialFullDisplay } from '../results-types/serials';
import { NameSummaryDisplay, NameFullDisplay } from '../results-types/name';
import { UniformTitleFullDisplay, UniformTitleSummaryDisplay } from '../results-types/uniformTitle';
import { HoldingsService } from '../../service/holdings.service';
import { AppRoutingState, ROUTING_STATE_KEY } from '../../service/base.service';



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

    // Data variables
    private urlParams: string = "";
    private catalogResultsData: NacsisCatalogResults;
    private numOfResults: number;
    private resultsSummaryDisplay: Array<IDisplayLinesSummary>;
    private resultFullDisplay;
    private fromIndex: number = 1;
    private toIndex: number = 20;



    // Templates
    @ViewChild('notSearched') notSearchedTmpl:TemplateRef<any>;
    @ViewChild('searchResults') searchResultsTmpl:TemplateRef<any>;
    @ViewChild('noResults') noResultsTmpl:TemplateRef<any>;
    @ViewChild('fullRecord') fullRecordTmpl:TemplateRef<any>;
    private currentResulsTmpl: TemplateRef<any>;

    isRightTableOpen: boolean = false;
    isColapsedMode: boolean = true;


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
            this.searchFormRefill();
        }
    }

    
    // Search Form Section

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

    onTabChange(event: MatTabChangeEvent){
        this.currentSearchType =  this.SEARCH_TYPE_ARRAY[event.index];
        this.currentDatabase = this.getCurrentDatabases()[0];
        if(this.catalogService.getSearchResults(this.currentSearchType).getResults() != null){
            this.setSearchResultsDisplay();
        } else {
            this.currentResulsTmpl = this.notSearchedTmpl;
            this.panelState = true;
        }
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

    generateUrl() {
        this.urlParams = "";
        this.urlParams = this.urlParams + this.getPaginationIndex();
        this.urlParams = this.urlParams + "&" + QueryParams.searchType + "=" + this.currentSearchType;
        this.urlParams =  this.urlParams + "&" + QueryParams.databases + "=" + this.currentDatabase;
        let valuableFields = this.allFieldsMap.get(this.currentSearchType).filter(field => field.getFormControl().value !== null);
        if (valuableFields.length > 0){
            valuableFields.forEach(field => {
                    this.urlParams =  this.urlParams + "&" + field.getKey();
                    this.urlParams =  this.urlParams + "=" + field.getFormControl().value;
            });
        } else {
            this.urlParams = "";
        }
    } 
    


    search() {
        this.generateUrl();
        if(this.urlParams == ""){
            this.alert.error(this.translate.instant('Catalog.Form.EmptyForm'), {keepAfterRouteChange:true});
            return;
        }

        this.loading = true;
        try{
            this.catalogService.getSearchResultsFromNacsis(this.urlParams, this.currentSearchType)
            .subscribe({
                next: (catalogResults) => {
                    if (catalogResults.status === this.catalogService.OkStatus) {
                        this.setSearchResultsDisplay();
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


    // Summary View Section

    private setSearchResultsDisplay(){
        this.catalogResultsData = this.catalogService.getSearchResults(this.currentSearchType);
        this.numOfResults = this.catalogResultsData.getHeader().totalRecords;
        this.resultsSummaryDisplay = new Array();
        this.catalogResultsData.getResults()?.forEach(result=>{
            this.resultsSummaryDisplay.push(this.summaryDisplayFactory(this.translate, result));
        });    
        this.resultsTemplateFactory();
        this.panelState = false;
    }

    summaryDisplayFactory(translate: TranslateService, record: BaseResult){
        switch (this.currentSearchType) {
            case SearchType.Monographs:
                return new MonographSummaryDisplay(translate, record);
            case SearchType.Serials:
                return new SerialSummaryDisplay(translate, record);
            case SearchType.Names:
                return new NameSummaryDisplay(translate, record);
            case SearchType.UniformTitles:
                return new UniformTitleSummaryDisplay(translate, record);
            default:
                return null;
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

    onActionsClick(selection) {
        switch (selection[0]) {
            case 0: // Full view
                this.currentResulsTmpl = this.fullRecordTmpl;
                this.resultFullDisplay = this.fullDisplayFactory(selection[1].getFullRecordData()).initContentDisplay();
                break;
            case 1: // Import the record
                this.onImportRecord(selection[1].getFullRecordData().getRawData());
                break;
            case 2: // View Holdings
                this.onViewHoldings(selection[1].getFullRecordData().getID(), selection[1].getDisplayTitle());
                break;
            default: {
                this.currentResulsTmpl = this.noResultsTmpl;
            }
        }
        
    }
    
    onTitleClick(result: IDisplayLinesSummary) {
        // Opening the full view 
        this.currentResulsTmpl = this.fullRecordTmpl;
        this.resultFullDisplay = this.fullDisplayFactory(result.getFullRecordData()).initContentDisplay();
    }


    // Full View Section

    fullDisplayFactory(record: BaseResult){
        switch (this.currentSearchType) {
            case SearchType.Monographs:
                return new MonographFullDisplay(record.getFullView());
             case SearchType.Serials:
                return new SerialFullDisplay(record.getFullView());
            case SearchType.Names:
                return new NameFullDisplay(record.getFullView());
            case SearchType.UniformTitles:
                return new UniformTitleFullDisplay(record.getFullView());
            default:
                return null;
        }
    }

    onBackFromFullView() {
        this.currentResulsTmpl = this.searchResultsTmpl;
        this.isRightTableOpen = false;
    }
    
    onFullViewLink(searchType?: string) {
        this.isRightTableOpen = true;
        this.isColapsedMode = (window.innerWidth <= 600) ? true : false;
    }

    onFullViewLinkClose() {
        this.isRightTableOpen = false;
    }

    onResize(event) {
        this.isColapsedMode = (event.target.innerWidth <= 600) ? true : false;
    }
    

    // View Holdings

    onViewHoldings(nacsisId: string, title: string) {
        this.loading = true;
        title = "Harry Potter"
        try {
            this.holdingsService.getHoldingsFromNacsis(nacsisId, "Mine")
            .subscribe({
            next: (header) => {
                if (header.status === this.holdingsService.OkStatus) {
                    sessionStorage.setItem(ROUTING_STATE_KEY, AppRoutingState.CatalogSearchPage);
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

    // Import

    onImportRecord(rawData: string) {
        this.loading = true;
        try {
            this.catalogService.importRecordToAlma(this.currentSearchType, rawData)
            .subscribe({
                next: (warnings) => {
                    let x = 7;
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


    // Pagination
    
    getPaginationIndex() {
        return QueryParams.fromIndex + "=" + this.fromIndex + "&" + QueryParams.toIndex + "=" + this.toIndex;
    }
    
    onPageAction(pageEvent: PageEvent) {
        this.fromIndex = (pageEvent.pageIndex*20) + 1;
        this.toIndex = (pageEvent.pageIndex+1) * 20;
        this.search();
    }


    searchFormRefill() { 
        let paramsMap = new Map();
        this.catalogService.getQueryParams().split("&").forEach(param => {
            let paramAsKeyValue = param.split("=");
            paramsMap.set(paramAsKeyValue[0],paramAsKeyValue[1]);
        });
        this.currentSearchType = SearchType[paramsMap.get('searchType')];
        this.currentDatabase = paramsMap.get('database');
        this.allFieldsMap.get(this.currentSearchType).forEach(field => {
            if(paramsMap.has(field.getKey())){
                field.setFormControl(paramsMap.get(field.getKey()));
            }
        });
        this.setSearchResultsDisplay();
    }

    

}
