import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SELECTED_REQUEST_TYPE } from '../../service/base.service';
import { CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';

@Component({
  selector: 'ILL-requestType',
  templateUrl: './requestType.component.html',
  styleUrls: ['./requestType.component.scss']
})
export class RequestTypeComponent implements OnInit {
  form: FormGroup;
  selected: string = 'COPYO'; 

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private storeService: CloudAppStoreService,
  ) {
    this.form = this.fb.group({
      requestType: [this.selected]
    });
  }

  ngOnInit(): void {
    this.storeService.get(SELECTED_REQUEST_TYPE).subscribe((value) => {
      if (value === null || value === undefined || (value !== 'COPYO' && value !== 'LOANO')) {
        this.selected = 'COPYO';
        this.storeService.set(SELECTED_REQUEST_TYPE, this.selected).subscribe();
      } else {
        this.selected = value;
      }
      this.form.get('requestType')?.setValue(this.selected, { emitEvent: false });
    });
  
    this.form.get('requestType')?.valueChanges.subscribe((value) => {
      if (value) {
        this.selected = value;
        this.storeService.set(SELECTED_REQUEST_TYPE, this.selected).subscribe();
      }
    });
  }
  
  
  goNext(): void {
    this.router.navigate(['ILLBorrowingMain']);
  }
}
