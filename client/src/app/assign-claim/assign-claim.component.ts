import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
@Component({
  selector: 'app-assign-claim',
  templateUrl: './assign-claim.component.html',
  styleUrls: ['./assign-claim.component.scss']
})

export class AssignClaimComponent implements OnInit {

  itemForm: FormGroup;
  formModel: any = {
    claimId: null,
    underwriterId: null
  };
  showError: boolean = false;
  errorMessage: any;
  assignModel: any = {};
  showMessage: any;
  responseMessage: any;
  claimList: any[] = [];
  underwriterList: any[] = [];

  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.itemForm = this.formBuilder.group({
      claimId: [this.formModel.claimId, Validators.required],
      underwriterId: [this.formModel.underwriterId, Validators.required]
    });
  }
  ngOnInit(): void {
    this.getClaims();
    this.getUnderwriter();
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.showError = true;
      return;
    }

    this.httpService.AssignClaim(this.itemForm.value).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Claim assigned successfully';
        alert("Claim assigned successfully")
        this.itemForm.reset({
          claimId: null,
          underwriterId: null
        });
      },
      error: (err) => {
        this.showError = true;
        this.responseMessage = 'Failed to assign claim';
        this.errorMessage = err;
      }
    });
  }

  getClaims(): void {
    this.httpService.getAllClaims().subscribe({
      next: (res: any) => {
        this.claimList = res;
        console.log(this.claimList);
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err;
      }
    });
  }

  getUnderwriter(): void {
    this.httpService.GetAllUnderwriter().subscribe({
      next: (res: any) => {
        this.underwriterList = res;
        console.log(this.underwriterList);

      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err;
      }
    });
  }
}











