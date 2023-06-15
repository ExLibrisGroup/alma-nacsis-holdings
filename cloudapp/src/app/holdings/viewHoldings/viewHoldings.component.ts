import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HoldingsService, Holding } from '../../service/holdings.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../dialog/confirmation-dialog.component';
import { AlertService, CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';
import { AppRoutingState, ROUTING_STATE_KEY } from '../../service/base.service';
import { Action, RecordSelection } from '../../user-controls/result-card/result-card.component';
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-holdings',
  templateUrl: './viewHoldings.component.html',
  styleUrls: ['./viewHoldings.component.scss']
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
  _owner: string = 'All';
  backSession;//: AppRoutingState;

  @Output() onActionSelected = new EventEmitter<RecordSelection>(); 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private nacsis: HoldingsService,
    private dialog: MatDialog,
    private alert: AlertService,
    private storeService: CloudAppStoreService
  ) {
    this.owners = [
      { id: "0", name: "Holdings.ViewHoldings.All" },
      { id: "1", name: "Holdings.ViewHoldings.Mine" }
    ];
  }

  public ACTIONS_MENU_LIST = new Array(
    new Action('Catalog.Results.Actions.Edit', false),
    new Action('Catalog.Results.Actions.Delete', false),
  );

  ngOnInit() {
    this.mmsId = this.route.snapshot.params['mmsId'];
    this.mmsTitle = this.route.snapshot.params['mmsTitle'];
    this.storeService.get(ROUTING_STATE_KEY).pipe(
      mergeMap(backSession =>{
        if(backSession === undefined) {
          backSession = AppRoutingState.HoldingsMainPage;
        }
        this.backSession = backSession;
        return this.storeService.get(this.nacsis.OwnerKey);
      }),
      mergeMap(owner => {
        if(!this.nacsis.isEmpty(owner)) {
          this.selected = owner;
        } else if(this.nacsis.isEmpty(this.selected)) {
          this.selected = '1'; // owner = Mine
        } 
        return of();
      })
    ).subscribe();
    this.load();
  }

  load() {
    let header = this.nacsis.getHeader();
    if (header && header.status === this.nacsis.OkStatus) {
      this.type = header.type;
      this.holdings = this.nacsis.getHoldingList();
    }
  }

  getMmsInfoTitle(): string {
    return this.mmsTitle + " (" + this.mmsId + ")";
  }

  onOwnerSelected() {
    
    this.storeService.set(this.nacsis.OwnerKey, this.selected).subscribe();
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
              console.log(e);
              this.alert.error(e.message, {keepAfterRouteChange:true});
            },
            complete: () => this.loading = false
          });
      } catch (e) {
        this.loading = false;
        console.log(e);
        this.alert.error(this.translate.instant('General.Errors.generalError'), {keepAfterRouteChange:true});  
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
        message: this.translate.instant('Holdings.ViewHoldings.ConfirmDelete'),
        title: this.translate.instant('Holdings.ViewHoldings.DeleteTitle'),
        buttonText: {
          ok: this.translate.instant('Holdings.ViewHoldings.DeleteYesButton'),
          cancel: this.translate.instant('Holdings.ViewHoldings.DeleteNoButton')
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
                  this.alert.success(this.translate.instant('Holdings.ViewHoldings.Deleted'), {keepAfterRouteChange:true});  
                  this.nacsis.deleteHolding(holdingId);
                  this.router.navigate(['/holdings', this.mmsId, this.mmsTitle]);
                } else {
                  this.alert.error(header.errorMessage, {keepAfterRouteChange:true});  
                }
              },
              error: e => {
                this.loading = false;
                console.log(e);
                this.alert.error(e.message, {keepAfterRouteChange:true});
              },
              complete: () => this.loading = false
            });

        } catch (e) {
          this.loading = false;
          console.log(e);
          this.alert.error(this.translate.instant('General.Errors.generalError'));
         }
      }
    });
  }

  onCloseClick() {
    this.isErrorMessageVisible = false;
  }

  getResultActionList() {
    /*Note - all the actions in this component are avialable for mine holdings only
      So the value of  isEditable must be true*/
    const isEditable = true;
    return this.ACTIONS_MENU_LIST.filter(
      action  => action.avliableForAll || isEditable);
  }

  onActionsClick(holding: Holding, index : number) {
    switch (index) {
      case 0: // Edit
      this.router.navigate(['/holdings', this.mmsId, 'edit', holding.ID, this.mmsTitle]);
        break;
      case 1: // Delete
        this.delete(this.mmsId, holding.ID) 
        break;
      default: {
      }
    }
  }
}