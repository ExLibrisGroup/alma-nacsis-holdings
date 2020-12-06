import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
//import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NacsisService, Holding, Header } from '../nacsis.service';
import Swal from 'sweetalert2'
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../dialog/confirmation-dialog.component';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';


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
  isAllSearched: boolean;
  mmsTitle: string;
  type: string;

  // deleteTitle: string;
  // deleteMessage: string;
  isErrorMessageVisible: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    //private toastr: ToastrService,
    private translate: TranslateService,
    private nacsis: NacsisService,
    private dialog: MatDialog,
    private alert: AlertService

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
    if (this.selected === '0' && !this.isAllSearched) { // consider session storage
      await this.search("All");
    }
    this.ngOnInit();
  }

  async search(owner: String) {
    if (this.selected) {
      this.loading = true;

      try {
        let header: Header = await this.nacsis.getHoldingsFromNacsis(this.mmsId, owner);

        if (header.status === this.nacsis.OkStatus) {
          this.isAllSearched = true;
        } else {
          this.alert.error(header.errorMessage, {keepAfterRouteChange:true});  
        }
      } catch (e) {
        console.log(e);
        this.alert.error(this.translate.instant('Errors.generalError'), {keepAfterRouteChange:true});  
      } finally {
        this.loading = false;
      }
    }
  }

  getDisplayHoldings() {
    if (this.holdings) {
      if (this.selected == '0') { // All
        return this.holdings.sort((a: Holding, b: Holding) => { // sort list --> Mine first 
          if (a.editable) {
            return -1;
          } else if (b.editable) {
            return 1;
          } else {
            return 0;
          }
        });
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

  delete(mmsId: string, holdingId: string) {

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      autoFocus: false,
      data: {
        message: this.translate.instant('Holdings.ConfirmDelete'),
        title: this.translate.instant('Holdings.DeleteTitle'),
        buttonText: {
          ok: this.translate.instant('Holdings.DeleteYesButton'),
          cancel: this.translate.instant('Holdings.DeleteNoButton')
        }
      }/*,
      position: {
        top: '0px',
        left: '0px'
      }*/
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (confirmed) {
        this.loading = true;

        try {

          this.nacsis.deleteHoldingFromNacsis(mmsId, holdingId)
            .subscribe({
              next: (header) => {
                this.loading = false;
                console.log(header);
                if (header.status === this.nacsis.OkStatus) {
                  this.alert.success(this.translate.instant('Holdings.Deleted'), {keepAfterRouteChange:true});  
                  this.nacsis.deleteHolding(holdingId);
                  this.router.navigate(['/holdings', this.mmsId, this.mmsTitle]);
                } else {
                  this.alert.error(header.errorMessage, {keepAfterRouteChange:true});  
                }
              },
              error: e => {
                this.loading = false;
                console.log(e.message);
                this.alert.error(e.message, {keepAfterRouteChange:true});
              },
              complete: () => this.loading = false
            });

        } catch (e) {
          this.loading = false;
          console.log(e);
          this.alert.error(this.translate.instant('Errors.generalError'));
         }
      }
    });
  }

  async deleteUsingPromise(mmsId: string, holdingId: string) {

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
          var header: Header = await this.nacsis.deleteHoldingFromNacsisUsingPromise(mmsId, holdingId);

          console.log(header);

          if (header.status === this.nacsis.OkStatus) {
            this.alert.success(this.translate.instant('Holdings.Deleted'), {keepAfterRouteChange:true});  
            this.nacsis.deleteHolding(holdingId);
            this.router.navigate(['/holdings', this.mmsId, this.mmsTitle]);
          } else {
            this.alert.error(header.errorMessage, {keepAfterRouteChange:true});  
          }
        } catch (e) {
          console.log(e);
          this.alert.error(this.translate.instant('Errors.generalError'), {keepAfterRouteChange:true});  
        } finally {
          this.loading = false;
        }
      }
    });
  }

  onCloseClick() {
    this.isErrorMessageVisible = false;
  }
}