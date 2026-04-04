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
  searchFilter: any[] = [];

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

  private sortByDateDesc(list: any[]): any[] {
    return (list || []).sort((a, b) => {
      const dateA = new Date(a?.date).getTime();
      const dateB = new Date(b?.date).getTime();
      return dateB - dateA;
    });
  }

  getClaims() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.httpService.getClaimsByUnderwriter(userId).subscribe({
      next: (res: any) => {
        this.claimList = this.sortByDateDesc(res || []);
        this.searchFilter = [...this.claimList];
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
            alert('Claim updated successfully');
          }, 300);
        },
        error: (err) => {
          this.showError = true;
          this.errorMessage = err;
        }
      });
  }

  // ✅ UPDATED SEARCH: claim id/desc/status/type + policyholder details
  searchByDescId(event: any) {
    const q = (event.target.value || '').toLowerCase().trim();

    const filtered = this.claimList.filter((claim) => {
      const claimId = claim?.id != null ? String(claim.id).toLowerCase() : '';
      const desc = claim?.description?.toString().toLowerCase() || '';
      const status = claim?.status?.toString().toLowerCase() || '';
      const type = claim?.insuranceType?.toString().toLowerCase() || '';

      const phName = claim?.policyholder?.username?.toString().toLowerCase() || '';
      const phEmail = claim?.policyholder?.email?.toString().toLowerCase() || '';
      const phPhone = claim?.policyholder?.phoneNumber != null
        ? String(claim.policyholder.phoneNumber).toLowerCase()
        : '';

      return (
        claimId.includes(q) ||
        desc.includes(q) ||
        status.includes(q) ||
        type.includes(q) ||
        phName.includes(q) ||
        phEmail.includes(q) ||
        phPhone.includes(q)
      );
    });

    this.searchFilter = this.sortByDateDesc(filtered);
  }
}