import { Component, OnInit } from '@angular/core';
import { SearchItem, SearchType } from './form-utils';
import { MatSelectChange } from "@angular/material/select";
import { CatalogService } from '../../service/catalog.service';



@Component({
    selector: 'catalog-search-form',
    templateUrl: './search-form.component.html',
    styleUrls: ['./search-form.component.scss']
  })

export class CatalogSearchFormComponent{
    private catalogService: CatalogService;

    private ALL_DATABASES_MAP = new Map([
        [SearchType.Monographs, ['All','BOOK','PREBOOK','JPMARC','TRCMARC','USMARC','USMARCX','GPOMARC','UKMARC','REMARC','DNMARC','CHMARC','KORMARC','RECON','HBZBKS','SPABKS','ITABKS','KERISB','KERISX','BNFBKS']],
        [SearchType.Serials, ['All','SERIAL','JPMARCS','USMARCS','SPASER','ITASER','KERISS','BNFSER']],
        [SearchType.Names, ['All', 'NAME', 'JPMARCA', 'USMARCA']],
        [SearchType.UniformTitles, ['All', 'TITLE', 'USMARCT']]
    ]);
    private ALL_FIELDS_MAP = new Map([
        [SearchType.Monographs, ['TITLE','FTITLE','PTBL','VOL','TiPtVo','AUTH','ISSN','ISBN','NBN','NDLCN','PUB','YEAR','PLACE','CNTRY','LANG','SH','AKEY','ID','PID']],
        [SearchType.Serials, ['TITLE','FTITLE','AUTH','ISSN','CODEN','NDLPN','PUB','YEAR','PLACE','CNTRY','LANG','SH','AKEY','ID','FID']],
        [SearchType.Names, ['AUTH', 'AKEY', 'PLACE', 'DATE', 'ID', 'SAID']],
        [SearchType.UniformTitles, ['TITLE', 'AUTH', 'AKEY', 'ID', 'SAID']]
    ]);

    private currentSearchType: SearchType;
    private currentDatabase: string = 'All';  // default selection (includes all other DBs)
    private isSearchTypeChoosed: boolean = false;
    
    private searchItemArray: Array<SearchItem>;
    private url: string = "";      // TODO: getting the base url from the catalog service

    constructor(){}

    getSearchTypeList(): Map<string,string>{
        let searchTypeMap = new Map();  // <key: search type, value: translate's label>
        Object.values(SearchType).forEach(type=> {
            searchTypeMap.set(type, "Catalog.Form." + type + ".MainTitle")
        });
        return searchTypeMap;
    }

    searchTypeSelection(event: MatSelectChange){
        this.currentSearchType = SearchType[event.value];
        this.isSearchTypeChoosed = true;

        let fieldsArray = this.ALL_FIELDS_MAP.get(this.currentSearchType);
            this.searchItemArray = new Array();
            fieldsArray.forEach(field => {
                this.searchItemArray.push(new SearchItem(field, this.currentSearchType));
            });    
    }

    getDatabases(): Array<string> {
        return this.ALL_DATABASES_MAP.get(this.currentSearchType);
    }

    save() {
        this.url = "";
        this.url = this.url + "searchType=" + this.currentSearchType;
        this.url =  this.url + "&database=" + this.currentDatabase;
        this.searchItemArray.forEach(item =>{
            if(item.getFormControl().value !== null){
                this.url =  this.url + "&" + item.getKey();
                this.url =  this.url + "=" + item.getFormControl().value;
            }
        });
    } 

    clear() {
        this.searchItemArray.forEach(searchItem => {
            searchItem.getFormControl().setValue(null)
        });        
    }

}

