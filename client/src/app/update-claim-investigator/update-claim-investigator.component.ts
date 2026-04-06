import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { ToastService } from '../../services/toast.service';

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

  assignModel: any = {};
  showMessage: any;
  responseMessage: any;

  activeTab: 'in-progress' | 'completed' = 'in-progress';
  searchTerm: string = '';

  closing = false;
  updatedId: number | null = null;

  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.itemForm = this.formBuilder.group({
      description: ['', Validators.required],
      date: ['', Validators.required],
      status: ['', Validators.required],
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
        this.applyFilters();
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err;
      }
    });
  }

  edit(val: any) {
    this.updatedId = val.id;
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
        this.toastService.show('Claim updated successfully', 'success');
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err;
      }
    });
  }

  cancelUpdate() {
    this.closing = true;

    setTimeout(() => {
      this.updatedId = null;
      this.itemForm.reset();
      this.showError = false;
      this.closing = false;
    }, 300);
  }

  searchByDescId(event: any) {
    this.searchTerm = (event.target.value || '').toLowerCase().trim();
    this.applyFilters();
  }

  setTab(tab: 'in-progress' | 'completed') {
    this.activeTab = tab;
    this.applyFilters();
  }

  applyFilters() {
    const q = this.searchTerm;

    const filtered = this.claimList.filter((claim) => {
      // 1. Filter by Tab
      const isCompleted = claim.status === 'Approved' || claim.status === 'Rejected';
      if (this.activeTab === 'completed' && !isCompleted) return false;
      if (this.activeTab === 'in-progress' && isCompleted) return false;

      if (!q) return true;

      // 2. Filter by Search Query
      const claimId = claim?.id != null ? String(claim.id).toLowerCase() : '';
      const desc = claim?.description?.toString().toLowerCase() || '';
      const status = claim?.status?.toString().toLowerCase() || '';
      const type = claim?.insuranceType?.toString().toLowerCase() || '';

      const phName = claim?.policyholder?.username?.toString().toLowerCase() || '';
      const phEmail = claim?.policyholder?.email?.toString().toLowerCase() || '';
      const phPhone = claim?.policyholder?.phoneNumber != null ? String(claim.policyholder.phoneNumber).toLowerCase() : '';

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