import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Holding } from '../nacsis.service';

//export const holdingFormGroup = (holding: Holding = null): FormGroup => {
export const holdingFormGroup = (element, type): FormGroup => {

  var newHolding: boolean = false;
  const book: string = "BOOK";

  //if (holding == null) {
  if (element == null) {
    newHolding = true;
  }

  if (type === book) {
    return new FormGroup({
      VOL: new FormControl(newHolding ? '' : element.VOL),
      CLN: new FormControl(newHolding ? '' : element.CLN),
      RGTN: new FormControl(newHolding ? '' : element.RGTN),
      CPYR: new FormControl(newHolding ? '' : element.CPYR),
      CPYNT: new FormControl(newHolding ? '' : element.CPYNT),
      LDF: new FormControl(newHolding ? '' : element.LDF)
    });
  }

  // serial
  return new FormGroup({
    HLYR: new FormControl(newHolding ? '' : element.HLYR, Validators.required),
    HLV: new FormControl(newHolding ? '' : element.HLV, Validators.required),
    CONT: new FormControl(newHolding ? '' : element.CONT),
    CLN: new FormControl(newHolding ? '' : element.CLN),
    LDF: new FormControl(newHolding ? '' : element.LDF),
    CPYNT: new FormControl(newHolding ? '' : element.CPYNT)
  });
  // return new FormGroup({
  // id: new FormControl(holding.ID, Validators.required),
  // description: new FormControl(holding.description, Validators.required),
  // library: new FormControl(holding.libraryFullName),
  // location: new FormControl(holding.LOC),
  // ill: new FormControl(holding.ill),
  // info: new FormControl(holding.info)
  // });
}