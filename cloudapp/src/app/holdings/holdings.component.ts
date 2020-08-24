import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { tap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NacsisService, Holding, Header } from '../nacsis.service';

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
  isAllSelected: boolean;
  mmsTitle: string;
  type: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
      this.selected = '1'; // owner = Mine
    }
    this.load();
  }

  load() {
    this.holdings = this.nacsis.getHoldingList();
    this.type = this.nacsis.getHeader().type;
  }

  async onOwnerSelected() {
    // owner = All, Mine include in All, therefore, no need to retrieve from nacsis
    // get All only once
    if(this.selected === '0' && !this.isAllSelected) { 
      await this.search("All");
    }
    this.ngOnInit();
  }

  async search(owner: String) {
    if (this.selected) {
      this.loading = true;

      try {
        var header: Header = await this.nacsis.getHoldingResponse(this.mmsId, owner);

        if (header.status != this.nacsis.OkStatus) {
          this.toastr.error(header.errorMessage);
        } else {
          this.isAllSelected = true;
        }
      } catch (e) {
        console.log(e.error);
        this.toastr.error(this.translate.instant('Errors.generalError'));
      } finally {
        this.loading = false;
      }
    }
  }

  getDisplayHoldings() {
    if (this.holdings) {
      if (this.selected == '0') { // All
        return this.holdings;
      }
      return this.holdings.filter((holding) => holding.editable);
    }
  }

  delete(mmsId: string, holdingId: string) {
    if (confirm(this.translate.instant('Holdings.ConfirmDelete'))) {
      this.loading = true;
      this.nacsis.deleteHoldingFromNacsis(mmsId, holdingId)
        .subscribe({
          next: (response) => {
            console.log(response);

            var header: Header = response;
            if(header.status != this.nacsis.OkStatus) {
              this.toastr.error(header.errorMessage);
            } else {
              this.toastr.success(this.translate.instant('Holdings.Deleted'));
              this.nacsis.deleteHolding(holdingId);
            }
            this.router.navigate(['/holdings', this.mmsId, this.mmsTitle]);
          },
          error: e => this.toastr.error(e),
          complete: () => this.loading = false
        })
    }
  }

}