import { Injectable } from '@angular/core';
import { CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { IllService,AlmaRecordsResults, IDisplayLines,BaseRecordInfo,AlmaRecordInfo,AlmaRecord,AlmaRecordDisplay, AlmaRequestInfo } from '../service/ill.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AlmaApiService {

  integrationProfile :IntegrationProfile;
  recordInfoList: AlmaRecordInfo[] = new Array();
  recordsSummaryDisplay: Array<IDisplayLines>;
  almaResultsData: AlmaRecordsResults;
  almaRecord: AlmaRecord = new AlmaRecord('',this.translate,this.illService);
  baseRecordInfoList: Array<BaseRecordInfo> = new Array();

  constructor(
    private restService: CloudAppRestService,
    private translate: TranslateService,
    private illService: IllService,
  ) {  }

  extractNacsisId(stringXml, systemNumberPrefix) : string{
    const doc = new DOMParser().parseFromString(stringXml, "application/xml");
    let datafields = doc.getElementsByTagName("datafield");
    let subfield_016_a, subfield_016_2, subfield_035_a;

    for (let index = 0; index < datafields.length; index++) {
      const field = datafields[index];
      let tag = field.getAttribute("tag").valueOf();
      
      if(tag === "016") {
        let subfields = field.getElementsByTagName("subfield");
        for (let index = 0; index < subfields.length; index++) {
          const subfield = subfields[index];
          let tag = subfield.getAttribute("code").valueOf();
          if(tag === "a") {
            subfield_016_a = subfield.innerHTML;
          }
          if(tag === "2") {
            subfield_016_2 = subfield.innerHTML;
          }
        }
        if(subfield_016_2 == systemNumberPrefix) {
          return subfield_016_a;
        }
      }

      if(tag === "035"){
        let subfields = field.getElementsByTagName("subfield");
        for (let index = 0; index < subfields.length; index++) {
          const subfield = subfields[index];
          let tag = subfield.getAttribute("code").valueOf();
          if(tag === "a") {
            subfield_035_a = subfield.innerHTML;
            if(subfield_035_a.indexOf(systemNumberPrefix) != -1){
              //(NII)BA000111 
              return subfield_035_a.replace(systemNumberPrefix,"").replace("()","");
            }
          }
        }
      }
    }

    return "";
  }

  extractDisplayCardInfoFromRequest(record): AlmaRequestInfo{
    let recordInfo: AlmaRequestInfo = new AlmaRequestInfo();
    recordInfo.title = this.isEmpty(record.title)?'':record.title;
    recordInfo.author = this.isEmpty(record.author)?'':record.author;
    recordInfo.place_of_pub = this.isEmpty(record.place_of_publication)?'':record.place_of_publication;
    recordInfo.name_of_pub = this.isEmpty(record.publisher)?'':record.publisher;
    recordInfo.date_of_pub = this.isEmpty(record.year)?'':record.year;
    recordInfo.isbn = this.isEmpty(record.isbn)?'':record.isbn;
    recordInfo.issn = this.isEmpty(record.issn)?'':record.issn;
    recordInfo.exrernalId = this.isEmpty(record.external_id)?'':record.external_id;
    if(!this.isEmpty(record.requested_language)){
      recordInfo.language = this.isEmpty(record.requested_language.value)?'':record.requested_language.value;
    }else{
      recordInfo.language = '';
    }
    recordInfo.nacsisId = this.isEmpty(record.other_standard_id)?'':record.other_standard_id;

    return recordInfo;
  }


  extractDisplayCardInfo(stringXml, systemNumberPrefix): AlmaRequestInfo {

    const doc = new DOMParser().parseFromString(stringXml, "application/xml");

    let datafields = doc.getElementsByTagName("datafield");
    let controlfield = doc.getElementsByTagName("controlfield");

    let recordInfo: AlmaRequestInfo = new AlmaRequestInfo();
    //Title 
    let subfield_245_a, subfield_245_b, subfield_245_c;
    // Author 
    let subfield_100_a, subfield_110_a, subfield_111_a,
      subfield_700_a, subfield_720_a, subfield_711_a ;
    let authorArray = new Array();
    // Publisher  
    let subfield_260_a, subfield_260_b, subfield_260_c;
    // Language   
    let subfield_008_35_37;
    // ISBN/ISSN  
    let subfield_020_a, subfield_022_a;
    // NACSIS   
    let nacsisID;

    //490 all subfield
    let seriesSummary;

    try {

      subfield_008_35_37 = this.getValueFromControlFields(controlfield, "008").substring(35, 37);
      recordInfo.language = subfield_008_35_37;

      //NACSIS ID
      nacsisID = this.extractNacsisId(stringXml, systemNumberPrefix);
      recordInfo.nacsisId = nacsisID;

      //Title
      subfield_245_a = this.getValueFromDataFields(datafields, "245", "a");
      subfield_245_b = this.getValueFromDataFields(datafields, "245", "b");
      subfield_245_c = this.getValueFromDataFields(datafields, "245", "c");
      recordInfo.title = subfield_245_a + " " + subfield_245_b + " " + subfield_245_c;


      //Author
      subfield_100_a = this.getValueFromDataFields(datafields, "100", "a");
      subfield_110_a = this.getValueFromDataFields(datafields, "110", "a");
      subfield_111_a = this.getValueFromDataFields(datafields, "111", "a");

      subfield_700_a = this.getValueFromDataFields(datafields, "100", "a");
      subfield_720_a = this.getValueFromDataFields(datafields, "720", "a");
      subfield_711_a = this.getValueFromDataFields(datafields, "711", "a");

      authorArray.push(subfield_100_a);
      authorArray.push(subfield_110_a);
      authorArray.push(subfield_111_a);
      authorArray.push(subfield_700_a);
      authorArray.push(subfield_720_a);
      authorArray.push(subfield_711_a);

      let str = authorArray.find((e) => !this.isEmpty(e));
      if(this.isEmpty(str))str = "";
      recordInfo.author  = str;
     

      //Publisher
      subfield_260_a = this.getValueFromDataFields(datafields, "260", "a");
      subfield_260_b = this.getValueFromDataFields(datafields, "260", "b");
      subfield_260_c = this.getValueFromDataFields(datafields, "260", "c");

      recordInfo.place_of_pub = subfield_260_a;
      recordInfo.name_of_pub = subfield_260_b;
      recordInfo.date_of_pub = subfield_260_c;


      //ISBN/ISSN
      subfield_020_a = this.getValueFromDataFields(datafields, "020", "a");
      subfield_022_a = this.getValueFromDataFields(datafields, "022", "a");

      recordInfo.isbn = subfield_020_a;
      recordInfo.issn = subfield_022_a;
     

      //seriesSummary
      seriesSummary =  this.getAllSubfieldValueFromDataFields(datafields, "490");
      recordInfo.seriesSummaryAll = seriesSummary;

    } catch (error) {
      return new AlmaRequestInfo();
    }

    return recordInfo;
  }


  getValueFromDataFields(datafields, tag_send, subfield_send): string {

    let str = "";
    for (let index = 0; index < datafields.length; index++) {
      const field = datafields[index];
      let tag = field.getAttribute("tag").valueOf();
      if (tag === tag_send) {
        let subfields = field.getElementsByTagName("subfield");
        for (let index = 0; index < subfields.length; index++) {
          const subfield = subfields[index];
          let tag = subfield.getAttribute("code").valueOf();
          if (tag === subfield_send) {
            str = subfield.innerHTML;
          }
        }
      }
    }
    return str;
  }


  getAllSubfieldValueFromDataFields(datafields, tag_send): string {
    let str = "";
    for (let index = 0; index < datafields.length; index++) {
      const field = datafields[index];
      let tag = field.getAttribute("tag").valueOf();
      if (tag === tag_send) {
        let subfields = field.getElementsByTagName("subfield");
        for (let index = 0; index < subfields.length; index++) {
          const subfield = subfields[index];
          str = str.concat(subfield.innerHTML);
        }
      }
    }
    return str;
  }

  getValueFromControlFields(controlfield, tag_send): string {

    let str = "";
    for (let index = 0; index < controlfield.length; index++) {
      const field = controlfield[index];
      let tag = field.getAttribute("tag").valueOf();
      if (tag === tag_send) {
        str = field.innerHTML;
      }
    }
    return str;
  }

  isEmpty(val) {
    return (val === undefined || val == null || val.length <= 0) ? true : false;
  }
 

  getIntegrationProfile() {
 
    let url = "/conf/integration-profiles?type=CENTRAL_CATALOG_INTEGRATION";

    if(this.integrationProfile != null && this.integrationProfile != undefined) {
      return of(this.integrationProfile)
    }
    let libraryID: string = null;
    let repositoryImportProfile: string = null;
    let authorityImportProfileNames: string = null;
    let authorityImportProfileUniformTitles: string = null;
     
    return this.restService.call(url).pipe(
      mergeMap(response => { 
        // extract integration profile
        let nacsisIntegrationProfile = response.integration_profile[0]; // assume can be only one CENTRAL_CATALOG_INTEGRATION
        libraryID = nacsisIntegrationProfile.parameter.filter(param => param.action.value == "CENTRAL_CATALOG_INFORMATION_B" && param.name.value == "nacsisLibraryId")[0].value;
        // extract import profiles
        let ContributionConfigurationParams = nacsisIntegrationProfile.parameter.filter(param => param.action.value == "CENTRAL_CATALOG_CONTRIBUTION_CONFIGURATION");
        repositoryImportProfile = ContributionConfigurationParams.filter(param => param.name.value == "repositoryImportProfile")[0].value; 
        authorityImportProfileNames = ContributionConfigurationParams.filter(param => param.name.value == "authNames")[0].value;
        authorityImportProfileUniformTitles = ContributionConfigurationParams.filter(param => param.name.value == "authUniformTitle")[0].value;
        return of(this.integrationProfile); 
      }),
      mergeMap(() => {
        url = "/almaws/v1/conf/code-tables/NacsisExternalSystemCodes";
        return this.restService.call(url);
      }),
      mergeMap(response => {
        let libraryCode = response.row.filter(row => row.code == "libraryCode")[0].description;
        let systemPrefix = response.row.filter(row => row.code == "systemPrefix")[0].description;
        
        this.integrationProfile = new IntegrationProfile();
        this.integrationProfile.libraryCode = libraryCode;
        this.integrationProfile.libraryID = libraryID;
        this.integrationProfile.systemPrefix = systemPrefix;
        this.integrationProfile.repositoryImportProfile = repositoryImportProfile;
        this.integrationProfile.authorityImportProfileNames = authorityImportProfileNames;
        this.integrationProfile.authorityImportProfileUniformTitles = authorityImportProfileUniformTitles;
        return of(this.integrationProfile);
      })
    );
  }


  getAlmaRecodsInfo(records: any[]) {
    let index: number = 0;
    let disCards: AlmaRequestInfo[] = new Array();
    let singleRecordInfo: AlmaRequestInfo;

    records.forEach(record => {
      if(!this.isEmpty(record.bib)){
        singleRecordInfo = this.extractDisplayCardInfo(record.bib.anies, this.integrationProfile.libraryCode);
      }else{
        if(this.isEmpty(record.anies)){
          singleRecordInfo = this.extractDisplayCardInfoFromRequest(record);
  
         }else{
          singleRecordInfo = this.extractDisplayCardInfo(record.anies, this.integrationProfile.libraryCode);                 
        }
      }
      
      if (singleRecordInfo != null) {                 
        disCards[index]= singleRecordInfo;
      }
      index++;
    })

    return disCards;

  }

   setRecordsSummaryDisplay(recordInfoList: AlmaRequestInfo[],type: string){
    this.almaResultsData = new AlmaRecordsResults();
    this.baseRecordInfoList = new Array();
    recordInfoList.forEach(record=>{
      this.almaRecord = new AlmaRecord('',this.translate,this.illService);
      this.almaRecord.moduleType = type;
      this.illService.recordFillIn(this.almaRecord,record);
      this.baseRecordInfoList.push(this.almaRecord);
    });
    this.almaResultsData.setResults(this.baseRecordInfoList);

    this.recordsSummaryDisplay = new Array();
    this.almaResultsData.getResults()?.forEach(result=>{
      this.recordsSummaryDisplay.push(result.getSummaryDisplay());
    });  

    return this.recordsSummaryDisplay;
  }
}

export class IntegrationProfile {
    libraryCode: string;
    libraryID: string;
    systemPrefix: string;
    repositoryImportProfile: string;
    authorityImportProfileNames: string;
    authorityImportProfileUniformTitles: string;
}

