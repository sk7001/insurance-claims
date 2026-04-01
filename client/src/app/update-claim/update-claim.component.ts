import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-update-claim',
  templateUrl: './update-claim.component.html',
  styleUrls: ['./update-claim.component.scss']
})

export class UpdateClaimComponent implements OnInit {

  itemForm: FormGroup;
  formModel: any = { status: null };
  showError: boolean = false;
  errorMessage: any;
  claimList: any[] = [];
  assignModel: any = {};
  showMessage: any;
  responseMessage: any;
  updatedId: number | null = null;
  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {

    this.itemForm = this.formBuilder.group({
      description: ['', Validators.required],
      date: ['', Validators.required],
      status: [{ value: '', disabled: true }, Validators.required],
    });
  }

  ngOnInit(): void {
    this.getClaims();
  }

  getClaims() {
    this.httpService.getAllClaims().subscribe({
      next: (res: any) => {
        this.claimList = res;
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err;
      }
    });
  }

  edit(val: any) {
    this.updatedId = val.id;
    console.log(val)
    this.assignModel = val;
    this.itemForm.patchValue({
      description: val.description,
      status: val.status,
      date: this.formatDate(val.date),
    });
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.showError = true;
      return;
    }
    this.assignModel.date = this.itemForm.controls['date'].value;
    this.assignModel.status = this.itemForm.controls['status'].value;
    this.assignModel.description = this.itemForm.controls['description'].value;
    this.httpService.updateClaims(this.assignModel, this.updatedId).subscribe({
      next: () => {
        this.itemForm.reset({
          description: '',
          date: '',
          status: null
        });
        this.updatedId = null;
        this.getClaims();
        alert("Claim updated successfully");
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err;
      }
    });
  }
}



