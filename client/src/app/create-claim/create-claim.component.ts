import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-create-claim',
  templateUrl: './create-claim.component.html',
  styleUrls: ['./create-claim.component.scss']
})
export class CreateClaimComponent {

  itemForm: FormGroup;
  formModel: any = { description: '', date: '', status: '' };
  showError = false;
  errorMessage: any;
  claimList: any[] = [];
  assignModel: any = {};
  showMessage: any;
  responseMessage: any;
  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.itemForm = this.formBuilder.group({
      description: ['', Validators.required],
      date: ['', Validators.required],
      status: ['Initiated', Validators.required]
    });
  }


  getClaims(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return;
    }
    this.httpService.getClaimsByPolicyholder(userId).subscribe({
      next: (res: any) => {
        this.claimList = res;
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err;
      }
    });
  }

  onSubmit(): void {
    console.log(this.itemForm.value);
    if (this.itemForm.valid) {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        return;
      }
      this.httpService.createClaims(this.itemForm.value, userId).subscribe({
        next: () => {
          this.itemForm.reset({
            description: '',
            date: '',
            status: null
          });
          this.getClaims();
          this.showMessage = true;
          this.responseMessage = "Claim created successfully";
          alert("Claim created successfully");
          this.router.navigateByUrl('/view-claim-status');
        },
        error: (err) => {
          this.showError = true;
          this.errorMessage = err;
        }
      });
    } else {
      this.showError = true;
      return;
    }
  }
}


