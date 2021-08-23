import { SearchType } from "../main/form-utils";
import { Header } from "../../service/base.service";

export interface IDisplayLinesSummary {
    getDisplayTitle(): string;
    initContentDisplay(): Array<string>;
    getFullRecordData() : BaseResult;
}


export abstract class IDisplayLinesFull {
    protected record: any;
    protected fullViewLines: Array<FullViewLine>;

    constructor(fullViewRecord: any) {
        this.record = fullViewRecord;
    }

    initContentDisplay(){};

    protected addLine(header: FullViewField, content: Array<FullViewField>){
        let filteredArray = content.filter(field => field.hasContent() === true);
        if(filteredArray.length > 0){
            this.fullViewLines.push(new FullViewLine(header, filteredArray)); 
        }
    }

    protected dateFormatDisplay(field: string) {
        if(field != "" && field != undefined){
            return field.substring(0,4) + "/" + field.substring(4,6) + "/" + field.substring(6,8);
        } else {
            return "";
        }
    }

}


export class NacsisCatalogResults {
    header: ResultsHeader;
    results: Array<BaseResult>;

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
}

export class ResultsHeader extends Header {
    totalRecords: number;
    searchType: SearchType;
}

export abstract class BaseResult {
    ID: string = "";
    summaryView: any;
    fullView : any;
    rawData: string = "";

    constructor(record: any){
        this.ID = record.ID;
        this.summaryView = record.summaryView;
        this.fullView = record.fullView;
        this.rawData = record.rawData;
    }
    
    getID(){
        return this.ID;
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
}

export class FullViewField {

    private label: string;
    private content: string;
    private link: string;

    constructor(fieldBuilder: FieldBuilder) {
        this.label = fieldBuilder.getLabel();
        this.content = fieldBuilder.getContent();
        this.link = fieldBuilder.getLink();
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

    hasContent() {
        return (this.content != "" && this.content != undefined);
    }

    isLinkable() {
        return (this.link != null);
    }

    getLink() {
        return this.link;
    }

}

export class FieldBuilder {

    private _label: string;
    private _content: string;
    private _link: string;

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

    label(label: string) {
        this._label = label;
        return this;
    }

    content(content: string) {
        this._content = content;
        return this;
    }

    link(link: string) {
        this._link = link;
        return this;
    }

    build() {
        return new FullViewField(this);
    }
    
}

export class FullViewLine {

    constructor (
        private header: FullViewField,
        private content:  Array<FullViewField>
    ) { }
    
    getHeaderLabel() {
        return this.header.getLabel();
    }

    getContent() {
        return this.content;
    }
    
}
