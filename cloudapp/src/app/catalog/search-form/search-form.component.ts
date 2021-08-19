import { Component, AfterViewInit , ViewChild, TemplateRef } from '@angular/core';
import { SearchField, SearchType, FieldSize, FieldName } from './form-utils';
import { MatTabChangeEvent } from '@angular/material/tabs';
// import { MatMenuContent } from '@angular/material/menu';
import { CatalogService } from '../../service/catalog.service';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { IDisplayLinesSummary, NacsisCatalogResults, BaseResult, IDisplayLinesFull } from '../results-types/results-common'
import { MonographSummaryDisplay, MonographFullDisplay } from '../results-types/monographs'
import { SerialSummaryDisplay, SerialFullDisplay } from '../results-types/serials';
import { NameSummaryDisplay, NameFullDisplay } from '../results-types/name';
import { UniformTitleFullDisplay, UniformTitleSummaryDisplay } from '../results-types/uniformTitle';
import { HoldingsService } from '../../service/holdings.service';
import { AppRoutingState, ROUTING_STATE_KEY } from '../../service/base.service';



@Component({
    selector: 'catalog-search-form',
    templateUrl: './search-form.component.html',
    styleUrls: ['./search-form.component.scss']
  })

export class CatalogSearchFormComponent implements AfterViewInit {

    public SEARCH_TYPE_ARRAY = new Array (SearchType.Monographs, SearchType.Serials, SearchType.Names, SearchType.UniformTitles);
    public ALL_DATABASES_MAP = new Map([
        [SearchType.Monographs, ['All','BOOK','PREBOOK','JPMARC','TRCMARC','USMARC','USMARCX','GPOMARC','UKMARC','REMARC','DNMARC','CHMARC','KORMARC','RECON','HBZBKS','SPABKS','ITABKS','KERISB','KERISX','BNFBKS']],
        [SearchType.Serials, ['All','SERIAL','JPMARCS','USMARCS','SPASER','ITASER','KERISS','BNFSER']],
        [SearchType.Names, ['All', 'NAME', 'JPMARCA', 'USMARCA']],
        [SearchType.UniformTitles, ['All', 'TITLE', 'USMARCT']]
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
    private currentDatabase: string = 'All';  // default selection (includes all other DBs)
    
    // UI variables
    private panelState: boolean = true;
    private loading: boolean = false;

    // Data variables
    private urlParams: string = "";
    private catalogResultsData: NacsisCatalogResults;
    private numOfResults: number;
    private resultsSummaryDisplay: Array<IDisplayLinesSummary>;
    private resultFullDisplay;

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
            this.searchFormRefill();
        }
    }

    
    // Search Form Section

    getSearchTypesLabels(): Array<string>{
        let searchTypeMap = new Array(); 
        this.SEARCH_TYPE_ARRAY.forEach(type=> {
            searchTypeMap.push("Catalog.Form." + type + ".MainTitle")
        });
        return searchTypeMap;
    }
    
    getCurrentDatabases(): Array<string> {
        return this.ALL_DATABASES_MAP.get(this.currentSearchType);
    }

    getSearchFields(): Array<SearchField> {
        return this.allFieldsMap.get(this.currentSearchType);
    }

    onTabChange(event: MatTabChangeEvent){
        this.currentSearchType =  this.SEARCH_TYPE_ARRAY[event.index];
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
        this.urlParams = this.urlParams + "searchType=" + this.currentSearchType;
        this.urlParams =  this.urlParams + "&database=" + this.getDatabaseParam();
        this.allFieldsMap.get(this.currentSearchType).forEach(item =>{
            if(item.getFormControl().value !== null){
                this.urlParams =  this.urlParams + "&" + item.getKey();
                this.urlParams =  this.urlParams + "=" + item.getFormControl().value;
            }
        });
    } 
    
    getDatabaseParam() {
        if(this.currentDatabase === 'All') {
            let allDatabases = this.ALL_DATABASES_MAP.get(this.currentSearchType)[1];  
            this.ALL_DATABASES_MAP.get(this.currentSearchType).slice(2).forEach(database=>{     // slice(2) -> skiping the two first positions
                allDatabases = allDatabases + "," + database;
            });
            return allDatabases;
        } else {
            return this.currentDatabase;
        }
    }

    search() {
        this.generateUrl();
        this.loading = true;

        try{
            this.catalogService.getSearchResultsFromNacsis(this.urlParams, this.currentSearchType)
            .subscribe({
                next: (catalogResults) => {
                    if (catalogResults.status === this.catalogService.OkStatus) {
                        if(this.currentSearchType == catalogResults.searchType){
                            this.setSearchResultsDisplay();
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
            this.alert.error(this.translate.instant('Errors.generalError'), {keepAfterRouteChange:true});      
        }
    }


    // Summary View Section

    private setSearchResultsDisplay(){
        this.catalogResultsData = this.catalogService.getSearchResults(this.currentSearchType);
        this.numOfResults = this.catalogResultsData.getHeader().totalRecords;
        this.resultsSummaryDisplay = new Array();
        this.catalogResultsData.getResults().forEach(result=>{
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
        } else if(this.numOfResults == 0) {
            this.currentResulsTmpl = this.noResultsTmpl;
        } else {
            this.currentResulsTmpl = this.notSearchedTmpl;
        }
    }

    onActionsClick(choice: number, result: IDisplayLinesSummary) {
        switch (choice) {
            case 0: // Full view
                this.currentResulsTmpl = this.fullRecordTmpl;
                this.resultFullDisplay = this.fullDisplayFactory(result.getFullRecordData()).initContentDisplay();
                break;
            case 2: // View Holdings
                this.onViewHoldings(result.getFullRecordData().getID(), result.getDisplayTitle());
                break;

            default: {
                this.currentResulsTmpl = this.noResultsTmpl;
            }
        }
        
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
    }
    
    isEvenRow(i: number) {
        if(i % 2 == 0){
            return "even";
        }
    }


    // View Holdings

    onViewHoldings(nacsisId: string, title: string) {
        this.loading = true;

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
            this.alert.error(this.translate.instant('Errors.generalError'), {keepAfterRouteChange:true});  
        }
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


