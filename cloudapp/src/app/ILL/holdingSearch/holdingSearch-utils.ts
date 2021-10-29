import { FormGroup, FormControl, Validators } from "@angular/forms";

export const holdingFormGroup = (holdingVolume): FormGroup =>{

    var newHoldingSearch: boolean = false;

    if (holdingVolume == null) {
        newHoldingSearch = true;
      }

    return new FormGroup({
        FANO: new FormControl(newHoldingSearch ? '' : holdingVolume.FANO),
        VOL_HLV: new FormControl(newHoldingSearch ? '' : holdingVolume.VOL_HLV),
        CPYR_HLYR: new FormControl(newHoldingSearch ? '' : holdingVolume.CPYR_HLYR),
        LOC: new FormControl(newHoldingSearch ? '' :  holdingVolume.LOC),
        KENCODE: new FormControl(newHoldingSearch ? '' :  holdingVolume.KENCODE),
        SETCODE: new FormControl(newHoldingSearch ? '' : holdingVolume.SETCODE),
        ORGCODE: new FormControl(newHoldingSearch ? '' : holdingVolume.ORGCODE),
        ILLFLG: new FormControl(newHoldingSearch ? '' : holdingVolume.ILLFLG),
        STAT: new FormControl(newHoldingSearch ? '' : holdingVolume.STAT),
        GRPCODE: new FormControl(newHoldingSearch ? '' : holdingVolume.GRPCODE),
        COPYS: new FormControl(newHoldingSearch ? '' : holdingVolume.COPYS),
        LOANS: new FormControl(newHoldingSearch ? '' : holdingVolume.LOANS),
        FAXS: new FormControl(newHoldingSearch ? '' : holdingVolume.FAXS)
      });

}

export enum FieldName {
    FANO = "FANO",
    VOL = "VOL",
    YEAR = "YEAR",
    LOC = "LOC",
    KENCODE = "_KENCODE_",
    SETCODE = "_SETCODE_",
    ORGCODE = "_ORGCODE_",
    GRPCODE = "_GRPCODE_",
    ILLFLG = "_ILLFLG_",
    STAT = "_STAT_",
    COPYS = "_COPYS_",
    LOANS = "_LOANS_",
    FAXS = "_FAXS_",
    Owner = "owner",
    nacsisId = "nacsisId"
}