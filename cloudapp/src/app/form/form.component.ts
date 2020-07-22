import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NacsisService, Holding, HoldingsBook, HoldingsSerial } from '../nacsis.service';
import { holdingFormGroup } from './form-utils';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  mmsId: string;
  mmsTitle: string;
  id: string;
  forms: FormGroup[];
  loading = false;
  type: string;
  location: string;
  book: string = "BOOK";
  libraryFullName: string;
  holding: Holding;
  isReadOnly: boolean;

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
    this.id = this.route.snapshot.params['id'];
    this.type = this.nacsis.getHeader().type;
    this.libraryFullName = this.getLibraryFullName();

    var url = this.route.url;

    this.load();
  }

  load() {
    if (this.id) { // update
      this.loading = true;
      this.nacsis.getHolding(this.id)
        .subscribe({
          next: holding => {
            this.holding = holding;
            this.location = this.holding.LOC;
     
            this.forms = new Array(this.holding.nacsisHoldingsList.length);

            this.holding.nacsisHoldingsList.forEach((element, index) => {
              this.forms[index] = holdingFormGroup(element, holding.type);
            });
            //this.form = holdingFormGroup(holding)
          },
          complete: () => this.loading = false
        });
    } else { // create/insert
      //this.form = holdingFormGroup();
      this.forms = new Array(0);
      this.forms[0] = holdingFormGroup(null, this.type); 
    }
  }
   
  getLibraryFullName(): string {
    return this.nacsis.getHeader().LIBABL + ' (' + 
    this.nacsis.getHeader().FANO + ')'
  }

  delete(index) {
    this.forms.splice(index, 1);
  }

  add() {
    this.forms.push(holdingFormGroup(null, this.type)); // from form.component.html
  }

  save() {
    this.loading = true;

    // TODO: do we need to use this.holding? shoud we need this member?
    var holding = new Holding(); 
    if(this.id) { // update // can get from url??? change url like post???
      holding.ID = this.id;
    }
    holding.BID = this.nacsis.getHeader().BID;
    holding.FANO = this.nacsis.getHeader().FANO;
    holding.LOC = this.location;
    holding.type = this.type;

    holding.nacsisHoldingsList = new Array(this.forms.length);

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
        holding.nacsisHoldingsList[index] = holdingsBook;
      } else {

        let holdingsSerial: HoldingsSerial = {
          HLYR: element.get('HLYR').value,
          HLV: element.get('HLV').value,
          CONT: element.get('CONT').value,
          CLN: element.get('CLN').value,
          LDF: element.get('LDF').value,
          CPYNT: element.get('CPYNT').value
        };
        holding.nacsisHoldingsList[index] = holdingsSerial;
      }
    });

    //this.nacsis.saveHolding(this.form.value)
    this.nacsis.saveHolding(holding)
      .subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('Form.Success'));
          this.router.navigate(['/holdings', this.mmsId, this.mmsTitle]);
        },
        error: e => this.toastr.error(e),
        complete: () => this.loading = false
      });
  }

  isBook(): boolean {
    return this.type === this.book;
  }
}
