import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SELECTED_REQUEST_TYPE } from '../../service/base.service';
import {  CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';

@Component({
  selector: 'ILL-requestType',
  templateUrl: './requestType.component.html',
  styleUrls: ['./requestType.component.scss']
})
export class RequestTypeComponent implements OnInit {
  form: FormGroup;
  loading: boolean;
  selected: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private storeService: CloudAppStoreService,

  ) {
    // Initialize the form with a 'requestType' field
    this.form = this.fb.group({
      requestType: ['']  // Initialize with an empty value
    });
  }

  ngOnInit(): void {
    // Subscribe to the valueChanges of the 'requestType' form control
    this.form.get('requestType')?.valueChanges.subscribe((value) => {
      this.selected = value;  // Update the selected value
      this.storeService.set(SELECTED_REQUEST_TYPE, this.selected).subscribe();  // Save to store service
    });
  }

  goNext(): void {
    this.router.navigate(['ILLBorrowingMain']);
  }
}
