import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-create-investigator',
  templateUrl: './create-investigator.component.html',
  styleUrls: ['./create-investigator.component.scss']
})
export class CreateInvestigatorComponent implements OnInit{
  itemForm: FormGroup;
  formModel: any = { report: '', status: '' };
  showError = false;
  assignModel:any ={};
  errorMessage: any;
  showMessage: any;
  responseMessage: any;
  investigationList: any[] = [];
  updateId: any;

  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.itemForm = this.formBuilder.group({
      report: [this.formModel.report, Validators.required],
      status: [this.formModel.status, Validators.required]
    });
  }
  ngOnInit(): void {
     this.getInvestigation(); 
  }

  getInvestigation(): void {
    this.httpService.getInvestigations().subscribe({
      next: (res: any) => {
        this.investigationList = res;
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err;
      }
    });
  }

  edit(val: any): void {
    this.updateId = val.id;
    this.itemForm.patchValue({
      report: val.report,
      status: val.status
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.showError = true;
      return;
    }

    if (this.updateId === null) {
      this.httpService.createInvestigation(this.itemForm.value).subscribe({
        next: () => {
          this.itemForm.reset({ report: '', status: '' });
          this.getInvestigation();
        },
        error: (err) => {
          this.showError = true;
          this.errorMessage = err;
        }
      });
    } else {
      this.httpService.updateInvestigation(this.itemForm.value, this.updateId).subscribe({
        next: () => {
          this.itemForm.reset({ report: '', status: '' });
          this.updateId = null;
          this.getInvestigation();
        },
        error: (err) => {
          this.showError = true;
          this.errorMessage = err;
        }
      });
    }
  }
}




