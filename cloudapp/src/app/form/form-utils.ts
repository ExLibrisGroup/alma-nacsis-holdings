import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Holding } from '../nacsis.service';

export const holdingFormGroup = (holding: Holding = null): FormGroup => {
  if (holding == null) holding = new Holding();
  return new FormGroup({
    id: new FormControl(holding.id, Validators.required),
    description: new FormControl(holding.description, Validators.required),
    library: new FormControl(holding.library),
    location: new FormControl(holding.location),
    ill: new FormControl(holding.ill)
  });
}