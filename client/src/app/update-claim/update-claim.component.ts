import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { ToastService } from '../../services/toast.service';

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
  searchFilter: any[] = [];
  activeClaimsList: any[] = [];
  resolvedClaimsList: any[] = [];
  activeTab: 'pending' | 'completed' = 'pending';

  assignModel: any = {};
  showMessage: any;
  responseMessage: any;

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
      status: [{ value: '', disabled: true }, Validators.required],
    });
  }

  ngOnInit(): void {
    this.getClaims();
  }

  /** ✅ Sort by date DESC (latest first) */
  private sortByDateDesc(list: any[]): any[] {
    return (list || []).sort((a, b) => {
      const dateA = new Date(a?.date).getTime();
      const dateB = new Date(b?.date).getTime();
      return dateB - dateA;
    });
  }

  getClaims() {
    this.httpService.getAllClaims().subscribe({
      next: (res: any) => {
        this.claimList = this.sortByDateDesc(res || []);
        this.searchFilter = [...this.claimList];
        this.updateLists();
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

  /** ✅ Search by claim + underwriter + policyholder details */
  searchByDescId(event: any) {
    const q = (event.target.value || '').toLowerCase().trim();

    const filtered = this.claimList.filter((claim) => {
      const claimId = claim?.id != null ? String(claim.id).toLowerCase() : '';
      const desc = claim?.description?.toString().toLowerCase() || '';
      const status = claim?.status?.toString().toLowerCase() || '';
      const type = claim?.insuranceType?.toString().toLowerCase() || '';

      // policyholder
      const phName = claim?.policyholder?.username?.toString().toLowerCase() || '';
      const phEmail = claim?.policyholder?.email?.toString().toLowerCase() || '';
      const phPhone = claim?.policyholder?.phoneNumber != null ? String(claim.policyholder.phoneNumber).toLowerCase() : '';

      // underwriter
      const uwName = claim?.underwriter?.username?.toString().toLowerCase() || '';
      const uwEmail = claim?.underwriter?.email?.toString().toLowerCase() || '';
      const uwPhone = claim?.underwriter?.phoneNumber != null ? String(claim.underwriter.phoneNumber).toLowerCase() : '';

      return (
        claimId.includes(q) ||
        desc.includes(q) ||
        status.includes(q) ||
        type.includes(q) ||
        phName.includes(q) ||
        phEmail.includes(q) ||
        phPhone.includes(q) ||
        uwName.includes(q) ||
        uwEmail.includes(q) ||
        uwPhone.includes(q)
      );
    });

    this.searchFilter = this.sortByDateDesc(filtered);
    this.updateLists();
  }

  updateLists() {
    this.activeClaimsList = this.searchFilter.filter(c => c.status === 'Initiated' || c.status === 'In progress' || c.status === 'Pending');
    this.resolvedClaimsList = this.searchFilter.filter(c => c.status === 'Approved' || c.status === 'Rejected');
  }

  setTab(tab: 'pending' | 'completed') {
    this.activeTab = tab;
  }
}