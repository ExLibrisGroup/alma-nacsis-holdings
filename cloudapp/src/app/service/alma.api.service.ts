import { Injectable } from '@angular/core';
import { CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AlmaApiService {

  integrationProfile :IntegrationProfile;

  constructor(
    private restService: CloudAppRestService,

  ) {  }

  /*
  <?xml version=\"1.0\" encoding=\"UTF-16\"?>
  <record>
    <leader>00944pam a2200301 a 4500</leader>
    <controlfield tag=\"001\">99960780000541</controlfield>
    ...
    <datafield ind1=\" \" ind2=\" \" tag=\"016\">
      <subfield code=\"a\">BB26104986</subfield>
      <subfield code=\"2\">JP-ToKJK</subfield>
    </datafield>
    ...
  </record>
  */
  extractNacsisId(stringXml, systemNumberPrefix) : string{
    const doc = new DOMParser().parseFromString(stringXml, "application/xml");
    let datafields = doc.getElementsByTagName("datafield");
    let subfield_016_a, subfield_016_2;

    for (let index = 0; index < datafields.length; index++) {
      const field = datafields[index];
      let tag = field.getAttribute("tag").valueOf();
      // console.log(tag);
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
        return null;
      }
    }
    return null;
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
  
}

export class IntegrationProfile {
    libraryCode: string;
    libraryID: string;
    systemPrefix: string;
    repositoryImportProfile: string;
    authorityImportProfileNames: string;
    authorityImportProfileUniformTitles: string;
}
