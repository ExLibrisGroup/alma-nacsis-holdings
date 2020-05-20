import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { tap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NacsisService } from '../nacsis.service';

@Component({
  selector: 'app-holdings',
  templateUrl: './holdings.component.html',
  styleUrls: ['./holdings.component.scss']
})
export class HoldingsComponent implements OnInit {
  mmsId: string;
  bib: any;
  holdings: any[];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private restService: CloudAppRestService,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    private nacsis: NacsisService
  ) { }

  ngOnInit() {
    this.mmsId = this.route.snapshot.params['mmsId'];
    this.load();
  }

  load() {
    this.loading = true;
    this.restService.call(`/bibs/${this.mmsId}`)
    .pipe(
      tap(bib => this.bib = bib),
      switchMap(bib => this.nacsis.getHoldings(bib))
    )
    .subscribe({
      next: resp => this.holdings = resp,
      error: e => this.toastr.error(e),
      complete: () => this.loading = false
    })
  }

  delete(holdingId) {
    if (confirm(this.translate.instant('Holdings.ConfirmDelete'))) {
      this.loading = true;
      this.nacsis.deleteHolding(holdingId)
      .subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('Holdings.Deleted'));
          this.load();
        },
        error: e => this.toastr.error(e),
        complete: () => this.loading = false
      })
    }
  }

}
