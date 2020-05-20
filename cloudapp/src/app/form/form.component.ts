import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NacsisService } from '../nacsis.service';
import { holdingFormGroup } from './form-utils';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  mmsId: string;
  id: string;
  form: FormGroup;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private translate: TranslateService,
    private nacsis: NacsisService 
  ) { }

  ngOnInit() {
    this.mmsId = this.route.snapshot.params['mmsId'];
    this.id = this.route.snapshot.params['id'];
    this.load();
  }

  load() {
    if (this.id) {
      this.loading = true;
      this.nacsis.getHolding(this.id)
      .subscribe({
        next: holding => this.form = holdingFormGroup(holding),
        complete: () => this.loading = false
      });
    } else {
      this.form = holdingFormGroup();
    }    
  }

  save() {
    this.loading = true;
    this.nacsis.saveHolding(this.form.value)
    .subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('Form.Success'));
        this.router.navigate(['/holdings', this.mmsId]);
      },
      error: e => this.toastr.error(e),
      complete: () => this.loading = false
    })    
  }

}
