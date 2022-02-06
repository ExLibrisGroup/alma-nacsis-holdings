import { FormGroup, FormControl, Validators } from "@angular/forms";

export const holdingFormGroup = (holdingVolume, isBook: boolean): FormGroup => {

  var createNewHolding: boolean = false;

  if (holdingVolume == null) {
    createNewHolding = true;
  }

  if (isBook) {
    return new FormGroup({
      VOL: new FormControl(createNewHolding ? '' : holdingVolume.VOL),
      CLN: new FormControl(createNewHolding ? '' : holdingVolume.CLN),
      RGTN: new FormControl(createNewHolding ? '' : holdingVolume.RGTN),
      CPYR: new FormControl(createNewHolding ? '' : holdingVolume.CPYR),
      CPYNT: new FormControl(createNewHolding ? '' : holdingVolume.CPYNT),
      LDF: new FormControl(createNewHolding ? '' : holdingVolume.LDF)
    });
  }

  // serial
  return new FormGroup({
    HLYR: new FormControl(createNewHolding ? '' : holdingVolume.HLYR, Validators.required),
    HLV: new FormControl(createNewHolding ? '' : holdingVolume.HLV, Validators.required),
    CONT: new FormControl(createNewHolding ? '' : holdingVolume.CONT),
    CLN: new FormControl(createNewHolding ? '' : holdingVolume.CLN),
    LDF: new FormControl(createNewHolding ? '' : holdingVolume.LDF),
    CPYNT: new FormControl(createNewHolding ? '' : holdingVolume.CPYNT)
  });
}