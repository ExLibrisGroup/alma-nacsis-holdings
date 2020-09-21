import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NacsisService, Holding, Header } from '../nacsis.service';
import Swal from 'sweetalert2'
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../dialog/confirmation-dialog.component';

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

  title: string;
  message: string;
  isErrorMessageVisible: boolean=false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    private nacsis: NacsisService,
    private dialog: MatDialog
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
    let header = this.nacsis.getHeader();
    if (header && header.status === this.nacsis.OkStatus) {
      this.type = header.type;
      this.holdings = this.nacsis.getHoldingList();
    }
  }

  async onOwnerSelected() {
    // owner = All, Mine include in All, therefore, no need to retrieve from nacsis
    // get All only once
    if (this.selected === '0' && !this.isAllSelected) {
      await this.search("All");
    }
    this.ngOnInit();
  }

  async search(owner: String) {
    if (this.selected) {
      this.loading = true;

      try {
        let header: Header = await this.nacsis.getHoldingsFromNacsis(this.mmsId, owner);

        if (header.status != this.nacsis.OkStatus) {
            this.showErrorMessage(this.translate.instant('Holdings.Errors.GetFailed'), header.errorMessage);
        } else {
          this.isAllSelected = true;
        }
      } catch (e) {
        console.log(e);
        this.showErrorMessage(this.translate.instant('Holdings.Errors.GetFailed'), this.translate.instant('Errors.generalError'));
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

  getNumOfRecords() {
    let holdings = this.getDisplayHoldings();
    if (holdings) {
      return holdings.length;
    }
    return 0;
  }

  isHoldingRecordsExist() {
    return (this.holdings && this.holdings.length > 0);
  }

  async delete(mmsId: string, holdingId: string) {

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        message: this.translate.instant('Holdings.ConfirmDelete'),
        buttonText: {
          ok: this.translate.instant('OK'),
          cancel: this.translate.instant('Cancel')
        }
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (confirmed) {
        this.loading = true;

        try {
          var header: Header = await this.nacsis.deleteHoldingFromNacsis(mmsId, holdingId);

          console.log(header);

          if (header.status != this.nacsis.OkStatus) {
              this.showErrorMessage(this.translate.instant('Holdings.Errors.DeleteFailed'), header.errorMessage);
          } else {
            this.toastr.success(this.translate.instant('Holdings.Deleted'));
            this.nacsis.deleteHolding(holdingId);

            this.router.navigate(['/holdings', this.mmsId, this.mmsTitle]);
          }
        } catch (e) {
          console.log(e);
            this.showErrorMessage(this.translate.instant('Holdings.Errors.DeleteFailed'), this.translate.instant('Errors.generalError'));
        } finally {
          this.loading = false;
        }
      }
    });
  }

  onCloseClick() {
    this.isErrorMessageVisible = false;
  }

  showErrorMessage(title: string, message: string) {
    this.title = title;
    this.message = message;
    this.isErrorMessageVisible = true;
  }
}