import { BaseUtil } from "./baseUtil";
import { FieldName, FieldSize, SearchField, SearchType } from '../user-controls/search-form/search-form-utils';
import { Injectable } from '@angular/core';
import { Action } from "../user-controls/result-card/result-card.component";
@Injectable({
  providedIn:'root'
})
export class CatalogUtil extends BaseUtil {

    public ALL_DATABASES_MAP = new Map([
        [SearchType.Monographs, ['BOOK','PREBOOK','JPMARC','TRCMARC','USMARC','USMARCX','GPOMARC','UKMARC','REMARC','DNMARC','CHMARC','KORMARC','RECON','HBZBKS','SPABKS','ITABKS','KERISB','KERISX','BNFBKS']],
        [SearchType.Serials, ['SERIAL','JPMARCS','USMARCS','SPASER','ITASER','KERISS','BNFSER']],
        [SearchType.Names, ['NAME', 'JPMARCA', 'USMARCA']],
        [SearchType.UniformTitles, ['TITLE', 'USMARCT']],
        [SearchType.Members, ['MEMBER']]
    ]);

    public ALL_DATABASES_MAP_SEARCH = new Map([
        [SearchType.Monographs, ['BOOK', 'PREBOOK', 'JPMARC', 'TRCMARC', 'USMARC', 'USMARCX', 'GPOMARC', 'UKMARC', 'REMARC', 'DNMARC', 'CHMARC', 'KORMARC', 'RECON', 'HBZBKS', 'SPABKS', 'ITABKS', 'KERISB', 'KERISX', 'BNFBKS']],
        [SearchType.Serials, ['SERIAL', 'JPMARCS', 'USMARCS', 'SPASER', 'ITASER', 'KERISS', 'BNFSER']],
        [SearchType.Names, ['NAME', 'JPMARCA', 'USMARCA']],
        [SearchType.UniformTitles, ['TITLE', 'USMARCT']]
    ]);

    public SEARCH_TYPE_ARRAY_CATALOG = new Array (SearchType.Monographs, SearchType.Serials, SearchType.Names, SearchType.UniformTitles);
        public SEARCH_TYPE_ARRAY_ILL = new Array (SearchType.Monographs, SearchType.Serials);

    public ALL_SEARCH_FIELDS_MAP = new Map([
        [SearchType.Monographs, this.initMonographsSearchFields()],
        [SearchType.Serials, this.initSerialsSearchFields()], 
        [SearchType.Names, this.initNamesSearchFields()], 
        [SearchType.UniformTitles, this.initUniformTitlesSearchFields()] 
    ]);
    // public ACTIONS_MENU_LIST = new Map([
    //     [SearchType.Monographs, [new Action('Catalog.Results.Actions.View'), new Action('Catalog.Results.Actions.Import')]],
    //     [SearchType.Serials, [new Action('Catalog.Results.Actions.View'), new Action('Catalog.Results.Actions.Import')]],
    //     [SearchType.Names, [new Action('Catalog.Results.Actions.View') , new Action('Catalog.Results.Actions.Import')]],
    //     [SearchType.UniformTitles, [new Action('Catalog.Results.Actions.View'), new Action('Catalog.Results.Actions.Import')]],
    // ]);

    public CATALOG_BOOKS_ACTIONS_MENU_LIST = new Array(
        new Action('Catalog.Results.Actions.View'),
        new Action('Catalog.Results.Actions.Import'),
        new Action('Catalog.Results.Actions.ViewHoldings'),
    );

    public CATALOG_ACTIONS_MENU_LIST = new Array(
        new Action('Catalog.Results.Actions.View'),
        new Action('Catalog.Results.Actions.Import'),
    );

    public CATALOG_ILL_ACTIONS_MENU_LIST = new Array(
        new Action('Catalog.Results.Actions.View'),
    );


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