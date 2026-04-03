import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-update-claim-investigator',
  templateUrl: './update-claim-investigator.component.html',
  styleUrls: ['./update-claim-investigator.component.scss']
})

export class UpdateClaimInvestigatorComponent implements OnInit {


  itemForm: FormGroup;
  formModel: any = { status: null };
  showError: boolean = false;
  errorMessage: any;
  claimList: any[] = [];
  assignModel: any = {};
  showMessage: any;
  responseMessage: any;
  updateId: any;


  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.itemForm = this.formBuilder.group({
      status: [this.formModel.status, Validators.required]
    });
  }


  ngOnInit(): void {
    this.getClaims();
  }


  getClaims() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return;
    }

    this.httpService.getClaimsByUnderwriter(userId).subscribe({
      next: (res: any) => {
        this.claimList = res;
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err;
      }
    });
  }

  edit(val: any): void {
    this.updateId = val.id;
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.showError = true;
      return;
    }
    this.httpService
      .updateClaimsStatus(this.itemForm.value.status, this.updateId)
      .subscribe({
        next: () => {
          this.itemForm.reset();
          this.updateId = null;
          this.getClaims();
          setTimeout(() => {
            alert("Claim updated successfully");
          }, 300);
        },
        error: (err) => {
          this.showError = true;
          this.errorMessage = err;
        }
      });
  }
}



