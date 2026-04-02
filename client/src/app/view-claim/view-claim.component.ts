import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
@Component({
  selector: 'app-view-claim',
  templateUrl: './view-claim.component.html',
  styleUrls: ['./view-claim.component.scss']
})

export class ViewClaimComponent implements OnInit {

  claimList: any[] = [];
  showError: boolean = false;
  errorMessage: any;

  constructor(
    public httpService: HttpService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getClaimsById();
  }

  getClaimsById() {
    this.httpService.getClaimsByPolicyholder(localStorage.getItem('userId')).subscribe({
      next: (res: any) => {
        this.claimList = res;
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = "No claims found";
      }
    });
  }


}












