import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { tap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NacsisService, Holding } from '../nacsis.service';

@Component({
  selector: 'app-holdings',
  templateUrl: './holdings.component.html',
  styleUrls: ['./holdings.component.scss']
})
export class HoldingsComponent implements OnInit {
  mmsId: string;
  bib: any;
  owners: any[];
  holdings: Holding[];
  loading = false;
  selected: string;
  mmsTitle: string;
  type: string;

  constructor(
    private route: ActivatedRoute,
    private restService: CloudAppRestService,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    private nacsis: NacsisService
  ) {   
    this.owners = [
      { id: "0", name: this.translate.instant('Holdings.All') },
      { id: "1", name: this.translate.instant('Holdings.Mine') }
    ];
  }

  ngOnInit() {
    this.mmsId = this.route.snapshot.params['mmsId'];
    this.mmsTitle = this.route.snapshot.params['mmsTitle'];

    if (!this.selected) {
      this.selected = '1'; // owner = mine
      this.load();
    }
  }

  async load() {
    this.loading = true;
    this.holdings = await this.nacsis.getHoldings(this.mmsId);
    this.type = this.nacsis.getHeader().type;
    this.loading = false;
  }

  onOwnerSelected() {
    this.getDisplayHoldings();
    this.ngOnInit();
  }

  getDisplayHoldings() {

    if (this.holdings) {
      if (this.selected == '0') { // All
        return this.holdings;
      }
      return this.holdings.filter((holding) => holding.editable);
    }
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
