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

  claimList: any[] = [];
  searchFilter: any[] = [];

  activeClaimsList: any[] = [];
  resolvedClaimsList: any[] = [];

  activeTab: 'pending' | 'completed' = 'pending';
  searchTerm: string = '';

  updatedId: number | null = null;
  closing = false;

  assignModel: any = {};

  showError = false;
  errorMessage: any;

  constructor(
    private httpService: HttpService,
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
    return (list || []).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  getClaims() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.httpService.getClaimsByUnderwriter(userId).subscribe({
      next: (res: any) => {
        this.claimList = this.sortByDateDesc(res || []);
        this.searchFilter = [...this.claimList];
        this.updateLists();
      }
    });
  }

  /** 🔥 SAME LOGIC AS FIRST COMPONENT */
  updateLists() {
    this.activeClaimsList = this.searchFilter.filter(c =>
      c.status === 'Initiated' ||
      c.status === 'In progress' ||
      c.status === 'Pending'
    );

    this.resolvedClaimsList = this.searchFilter.filter(c =>
      c.status === 'Approved' ||
      c.status === 'Rejected'
    );
  }

  searchByDescId(event: any) {
    const q = (event.target.value || '').toLowerCase().trim();

    const filtered = this.claimList.filter((claim) => {
      const claimId = String(claim?.id || '').toLowerCase();
      const desc = claim?.description?.toLowerCase() || '';
      const status = claim?.status?.toLowerCase() || '';
      const type = claim?.insuranceType?.toLowerCase() || '';

      const phName = claim?.policyholder?.username?.toLowerCase() || '';
      const phEmail = claim?.policyholder?.email?.toLowerCase() || '';

      return (
        claimId.includes(q) ||
        desc.includes(q) ||
        status.includes(q) ||
        type.includes(q) ||
        phName.includes(q) ||
        phEmail.includes(q)
      );
    });

    this.searchFilter = this.sortByDateDesc(filtered);
    this.updateLists();
  }

  setTab(tab: 'pending' | 'completed') {
    this.activeTab = tab;
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

  formatDate(date: any): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit() {
    if (this.itemForm.invalid) return;

    Object.assign(this.assignModel, this.itemForm.value);

    this.httpService.updateClaims(this.assignModel, this.updatedId).subscribe({
      next: () => {
        this.updatedId = null;
        this.getClaims();
        this.toastService.show('Updated successfully', 'success');
      }
    });
  }

  cancelUpdate() {
    this.closing = true;

    setTimeout(() => {
      this.updatedId = null;
      this.itemForm.reset();
      this.closing = false;
    }, 300);
  }
}