import { BaseUtil } from "./baseUtil";
import { Injectable } from '@angular/core';
@Injectable({
  providedIn:'root'
})
export class RoutingUtil extends BaseUtil {
  

}

export enum AppRoutingState {
    MainMenuPage = "",
    HoldingsMainPage = "/holdings",
    CatalogSearchPage = "/catalog",
    ILLBorrowingMainPage = "/ILL",
    SearchRecordMainPage = "/searchRecord",
    HoldingSearchMainPage = "/holdingSearch",
    MembersMainPage = "/members"
}

export enum SessionStorageKeys {
  ROUTING_STATE_KEY = "routingState",
  LIBRARY_ID_KEY = "libraryIDKey",
  LIBRARY_MEMBERINFO_KEY = "libraryMemberInfoKey",
  SELECTED_RECORD_ILL = "selectedDataInILL",
  SELECTED_RECORD_LIST_ILL = "selectedDataListInILL",
  RESULT_RECORD_LIST_ILL = "resultDataInILL",
  REQUEST_EXTERNAL_ID = "requestExternalId",
  MEMBER_RECORD = "memberRecord",
  FANO_ID = "fanoId",
  VOLUME_LIST = "volumeList",
  HOLDINGS_COLUMNS = "holdingsColumns",
  HOLDINGS_SEARCH_FIELDS = "holdingsFields",
  ILL_REQUEST_FIELDS = "illFields",
  SELECTED_INTEGRATION_PROFILE = "integrationProfile",
  SELECTED_LIB_NAME = "libraryName"
}





// Session Storage consts 
// TODO: Turned it into Enum
