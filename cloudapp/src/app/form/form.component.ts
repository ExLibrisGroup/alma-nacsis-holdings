import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NacsisService, Holding, HoldingsBook, HoldingsSerial, Header } from '../nacsis.service';
import { holdingFormGroup } from './form-utils';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  mmsId: string;
  mmsTitle: string;
  holdingId: string;
  forms: FormGroup[];
  loading = false;
  type: string;
  holding: Holding;
  isReadOnly: boolean;
  originLOC: string;

  book: string = "BOOK";
  urlViewSigment: string = "view";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private translate: TranslateService,
    private nacsis: NacsisService
  ) { }

  ngOnInit() {
    this.mmsId = this.route.snapshot.params['mmsId'];
    this.mmsTitle = this.route.snapshot.params['mmsTitle'];
    this.holdingId = this.route.snapshot.params['holdingId'];
    this.type = this.nacsis.getHeader().type;

    this.route.snapshot.url.forEach(sigment => {
      if(sigment.path == this.urlViewSigment) {
        this.isReadOnly = true;
      }
    });

    this.load();
  }

  load() {
    if (this.holdingId) { // update holding
      this.loading = true;
      this.nacsis.getHolding(this.holdingId)
        .subscribe({
          next: holding => {
            this.originLOC = holding.LOC;
            this.holding = holding;
            this.forms = new Array(this.holding.nacsisHoldingsList.length);

            this.holding.nacsisHoldingsList.forEach((holdingVolume, index) => {
              this.forms[index] = holdingFormGroup(holdingVolume, this.isBook());
            });
          },
          complete: () => this.loading = false
        });
    } else { // create new holding
      this.holding = new Holding();
      this.forms = new Array(0);
      this.forms[0] = holdingFormGroup(null, this.isBook()); 
    }
  }
   
  getLibraryFullName(): string {
    return this.nacsis.getHeader().LIBABL + ' (' + 
    this.nacsis.getHeader().FANO + ')'
  }

  // delete holding volume
  delete(index) {
    this.forms.splice(index, 1);
  }

  // add holding volume
  add() {
    this.forms.push(holdingFormGroup(null, this.type)); 
  }

  // to nacsis
  save() {
    this.loading = true;

    this.holding.BID = this.nacsis.getHeader().BID;
    this.holding.FANO = this.nacsis.getHeader().FANO;
    this.holding.type = this.type; 
   
    this.holding.nacsisHoldingsList = new Array(this.forms.length);

    this.forms.forEach((element, index) => {

      if (this.type === this.book) {

        let holdingsBook: HoldingsBook = {
          VOL: element.get('VOL').value,
          CLN: element.get('CLN').value,
          RGTN: element.get('RGTN').value,
          CPYR: element.get('CPYR').value,
          CPYNT: element.get('CPYNT').value,
          LDF: element.get('LDF').value
        };
        this.holding.nacsisHoldingsList[index] = holdingsBook;
      } else {

        let holdingsSerial: HoldingsSerial = {
          HLYR: element.get('HLYR').value,
          HLV: element.get('HLV').value,
          CONT: element.get('CONT').value,
          CLN: element.get('CLN').value,
          LDF: element.get('LDF').value,
          CPYNT: element.get('CPYNT').value
        };
        this.holding.nacsisHoldingsList[index] = holdingsSerial;
      }
    });

    this.nacsis.saveHolding(this.mmsId, this.holding)
      .subscribe({
        next: (response) => {
          console.log(response);

          var header: Header = response;
          if(header.status != this.nacsis.OkStatus) {
            this.toastr.error(header.errorMessage);
          } else {
            this.toastr.success(this.translate.instant('Form.Success'));
          }
          this.router.navigate(['']);

        },
        error: e => this.toastr.error(e),
        complete: () => this.loading = false
      });
  }

  cancel() {
    // restore holding to origin state
    this.holding.LOC = this.originLOC;
    this.router.navigate(['/holdings', this.mmsId, this.mmsTitle]);
  }

  isBook(): boolean {
    return this.type === this.book;
  }
}
