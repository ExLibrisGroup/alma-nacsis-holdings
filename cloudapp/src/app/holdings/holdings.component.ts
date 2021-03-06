import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
//import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { NacsisService, Holding, Header } from '../nacsis.service';
import { MatDialog } from '@angular/material/dialog';
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
  isAllRetrieved: boolean = false;
  mmsTitle: string;
  type: string;
  isErrorMessageVisible: boolean = false;
  _owner: string = 'All'


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    //private http: HttpClient,
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

    let owner = this.nacsis.getSessionStorageItem(this.nacsis.OwnerKey);

    if(!this.nacsis.isEmpty(owner)) {
      this.selected = owner;
    } else if(this.nacsis.isEmpty(this.selected)) {
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

  onOwnerSelected() {
    
    this.nacsis.setSessionStorageItem(this.nacsis.OwnerKey, this.selected);

   // owner = All, Mine is included in All, therefore, no need to retrieve from nacsis
    // get All only once
    if (this.selected === '0' && !this.isAllRetrieved) {
      this.searchAll();
    }
    //this.ngOnInit();
   }

  searchAll() {
    if (this.selected) {
      this.loading = true;

      try {
        this.nacsis.getHoldingsFromNacsis(this.mmsId, this._owner)
          .subscribe({
            next: (header) => {
              console.log(header);
              if (header.status === this.nacsis.OkStatus) {
                this.isAllRetrieved = true;
                this.ngOnInit();
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
        this.alert.error(this.translate.instant('Errors.generalError'), {keepAfterRouteChange:true});  
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

  onCloseClick() {
    this.isErrorMessageVisible = false;
  }
}