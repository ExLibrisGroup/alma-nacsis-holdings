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

export const initResourceInformationFormGroup = (): FormGroup =>{ 
  return new FormGroup ({
    ONO:new FormControl(),
    PRMT:new FormControl(),
    BIBID:new FormControl('', [Validators.required]),
    STDNO:new FormControl('', [Validators.required]),
    VOL:new FormControl(),
    PAGE:new FormControl(),
    YEAR:new FormControl(),
    BIBNT:new FormControl('', [Validators.required]),
    ARTCL:new FormControl()
  })
}

export const initRequesterInformationFormGroup = (): FormGroup =>{ 
  return new FormGroup ({
    BVRFY:new FormControl(),
    HVRFY:new FormControl(),
    CLNT:new FormControl(),
    CLNTP:new FormControl(),
    ODATE:new FormControl(new Date().toISOString()),

    SENDCMNT:new FormControl(),
    OSTAF:new FormControl('', [Validators.required]),
    OADRS:new FormControl('', [Validators.required]),
    OLDF:new FormControl(),
    OLDAF:new FormControl(),

    OEDA:new FormControl()
  })
}

export const initRotaFormGroup = (): FormGroup =>{ 
  return new FormGroup ({
    HMLID1:new FormControl(),
    HMLID2:new FormControl(),
    HMLID3:new FormControl(),
    HMLID4:new FormControl(),
    HMLID5:new FormControl(),

    HMLNM1:new FormControl(),
    HMLNM2:new FormControl(),
    HMLNM3:new FormControl(),
    HMLNM4:new FormControl(),
    HMLNM5:new FormControl(),

    LOC1:new FormControl(),
    LOC2:new FormControl(),
    LOC3:new FormControl(),
    LOC4:new FormControl(),
    LOC5:new FormControl(),
    
    
    VOL1:new FormControl(),
    VOL2:new FormControl(),
    VOL3:new FormControl(),
    VOL4:new FormControl(),
    VOL5:new FormControl(),

    CLN1:new FormControl(),
    CLN2:new FormControl(),
    CLN3:new FormControl(),
    CLN4:new FormControl(),
    CLN5:new FormControl(),

    RGTN1:new FormControl(),
    RGTN2:new FormControl(),
    RGTN3:new FormControl(),
    RGTN4:new FormControl(),
    RGTN5:new FormControl()
  })
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