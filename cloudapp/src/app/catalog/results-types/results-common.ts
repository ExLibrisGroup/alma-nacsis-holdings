import { TranslateService } from '@ngx-translate/core';
import { SearchType } from '../../user-controls/search-form/search-form-utils';

export const BLANK_SPACE = "&nbsp;";

//   NacsisCatalogResults contains the Nacsis servlet's response
export class NacsisCatalogResults {
    header: ResultsHeader;
    results: Array<BaseResult>;
    queryParams: string;

    constructor(){ }

    getHeader() {
        return this.header;
    }

    setHeader(header: ResultsHeader) {
        this.header = header;
    }

    getResults() {
        return this.results;
    }

    setResults(arr: Array<BaseResult>) {
        this.results = arr;
    }

    getQueryParams() {
        return this.queryParams;
    }

    setQueryParams(urlParams: string) {
        this.queryParams = urlParams;
    }
}

export class Header {
    status: string = ""
    errorMessage: string = ""
    BID: string = ""
    type: string = "" // BOOK/SERIAL
  }



export class ResultsHeader extends Header {
    totalRecords: number;
    searchType: SearchType;
}



// BaseResult a prototype of a Ncsis servlet's result
export abstract class BaseResult {
    id: string = "";
    summaryView: any;
    fullView : any;
    rawData: string = "";

    summaryDisplay: IDisplayLines;
    fullViewDisplay: IDisplayLines;

    constructor(
        record: any,
        protected translate: TranslateService
    ){
        this.id = record.id;
        this.summaryView = record.fullView; //summaryView;
        this.fullView = record.fullView;
        this.rawData = record.rawData;
    }
    
    getID(){
        return this.id;
    }

    getSummaryView(){
        return this.summaryView;
    }

    getFullView(){
        return this.fullView;
    }

    getRawData(){
        return this.rawData;
    }

    abstract getSummaryDisplay():IDisplayLines;

    abstract getFullViewDisplay():IDisplayLines;

}


export abstract class IDisplayLines {
    protected fullRecord: BaseResult;
    protected viewLines: Array<ViewLine>;
    protected titleLine: ViewLine;
    public isEditable  : boolean = false;


    constructor(viewRecord: BaseResult) {
        this.fullRecord = viewRecord;
    }

    setEnableEdit(isEditable: boolean) {
        this.isEditable = isEditable;
    }

    getFullRecordData() {
        return this.fullRecord;
    }

    initTitleDisplay():any{};

    initContentDisplay():any{};

    protected addLine(header: ViewField, content: Array<ViewField>){
        let filteredArray = content.filter(field => field.hasContent() || field.isOnlyLabel());
        if(filteredArray.length > 0){
            this.viewLines.push(new ViewLine(header, filteredArray)); 
        }
    }

    protected dateFormatDisplay(field: string) {
        if(field != "" && field != undefined){
            return field.substring(0,4) + "/" + field.substring(4,6) + "/" + field.substring(6,8);
        } else {
            return "";
        }
    }

    isEmpty(str): boolean {
        return (str == "" || str == undefined || str == null);
    }

    toStringPairOfFields(fieldA, fieldB, labelB?: string): string {
        let str = "";
        if(!this.isEmpty(fieldA)){
            str = str + fieldA;
        } if(!this.isEmpty(fieldA) && !this.isEmpty(fieldB)){
            str = str + labelB;
        } if(!this.isEmpty(fieldB)){
            str = str + fieldB;
        } return str;
    }

    setSeparator(fieldsArr: Array<ViewField>, separator: string): Array<ViewField> {
        let filteredArray = fieldsArr.filter(field => field.hasContent());
        let arrWithLabels = new Array<ViewField>();
        for (let i = 0; i < filteredArray.length; i++) {
            arrWithLabels.push(filteredArray[i]);
            if(i != filteredArray.length-1){
                arrWithLabels.push(new ViewFieldBuilder().label(separator).build());
            }
        }
        return arrWithLabels;
    }
}


export class ViewLine {

    constructor (
        private header: ViewField,
        private content:  Array<ViewField>
    ) { }
    
    getHeaderLabel() {
        return this.header.getLabel();
    }

    getContent() {
        return this.content;
    }
    
    protected toStringLine(): string{
        let lines = "";
        this.content.forEach(field => {
            if(field.getLabel() != undefined){
                lines = lines + field.getLabel() + " ";
            } if(field.getContent() != undefined){
                lines = lines + field.getContent() + " ";
            } 
        });
        return lines;
    }  
}

export class ViewField {

    private label: string;
    private content: string;
    private link: string;
    private onlyLabel: boolean;


    constructor(ViewFieldBuilder: ViewFieldBuilder) {
        this.label = ViewFieldBuilder.getLabel();
        this.content = ViewFieldBuilder.getContent();
        this.link = ViewFieldBuilder.getLink();
        this.onlyLabel = ViewFieldBuilder.isOnlyLabel()? true : false;
     }

    getLabel() {
        return this.label;
    }

    hasLabel() {
        return (this.label != null);
    }

    getContent() {
        return this.content;
    }

    getLink() {
        return this.link;
    }

    hasContent() {
        return (this.content != "" && this.content != undefined);
    }

    isLinkable() {
        return (this.link != null);
    }

    isOnlyLabel() {
        return this.onlyLabel;
    }
}

export class ViewFieldBuilder {

    private _label: string;
    private _content: string;
    private _link: string;
    private _onlyLabel: boolean = true;

    constructor() { }


    getLabel() {
        return this._label;
    }

    getContent() {
        return this._content;
    }

    getLink() {
        return this._link;
    }

    isOnlyLabel() {
        return this._onlyLabel;
    }

    label(label: string) {
        this._label = label;
        return this;
    }

    content(content: string) {
        this._content = content;
        this._onlyLabel = false;
        return this;
    }

    link(link: string) {
        this._link = link;
        return this;
    }

    build() {
        return new ViewField(this);
    }
}


