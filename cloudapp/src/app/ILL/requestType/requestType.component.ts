import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ILL-requestType',
  templateUrl: './requestType.component.html',
  styleUrls: ['./requestType.component.scss']
})
export class RequestTypeComponent {
  constructor(private router: Router) {}

  goBack() {
    // Navigate back or handle the "Back" button logic
    this.router.navigate(['/']);
  }

  goNext() {
    // Navigate to ILLBorrowingMainComponent when "Next" is clicked
    this.router.navigate(['/ILLBorrowingMain']);
  }
}
