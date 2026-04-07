import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-assign-claim',
  templateUrl: './assign-claim.component.html',
  styleUrls: ['./assign-claim.component.scss']
})
export class AssignClaimComponent implements OnInit {

  itemForm: FormGroup;
  formModel: any = { claimId: null, underwriterId: null };

  showError = false;
  errorMessage: any;

  showMessage: any;
  responseMessage: any;

  claimList: any[] = [];
  underwriterList: any[] = [];

  filteredClaimList: any[] = [];
  filteredUnderwriterList: any[] = [];

  claimSearch = '';
  underwriterSearch = '';

  claimDropdownOpen = false;
  underDropdownOpen = false;

  selectedClaimText = '';
  selectedUnderwriterText = '';

  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService
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

  /** ✅ sort claims by date DESC (latest first) */
  private sortByDateDesc(list: any[]): any[] {
    return (list || []).sort((a, b) => {
      const dateA = new Date(a?.date).getTime();
      const dateB = new Date(b?.date).getTime();
      return dateB - dateA;
    });
  }

  // Dropdown toggle
  toggleClaimDropdown() {
    this.claimDropdownOpen = !this.claimDropdownOpen;
    if (this.claimDropdownOpen) {
      this.underDropdownOpen = false;
    }
  }

  toggleUnderDropdown() {
    this.underDropdownOpen = !this.underDropdownOpen;
    if (this.underDropdownOpen) {
      this.claimDropdownOpen = false;
    }
  }

  // Close if clicking outside
  @HostListener('document:click', ['$event'])
  onDocClick(event: any) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.claimDropdownOpen = false;
      this.underDropdownOpen = false;
    }
  }

  // Fetch data
  getClaims(): void {
    this.httpService.getAllClaims().subscribe({
      next: (res: any) => {
        this.claimList = this.sortByDateDesc(res || []);
        this.filteredClaimList = [...this.claimList];
        this.calculateUnderwriterLoad();
        console.log('Claims:', this.filteredClaimList);
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
        this.underwriterList = res || [];
        this.filteredUnderwriterList = [...this.underwriterList];
        this.calculateUnderwriterLoad();
        console.log('Underwriters:', this.filteredUnderwriterList);
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err;
      }
    });
  }

  // ✅ calculate active cases per underwriter
  calculateUnderwriterLoad(): void {
    if (!this.underwriterList.length || !this.claimList.length) return;

    this.underwriterList.forEach(u => {
      u.activeCount = this.claimList.filter(c =>
        c.underwriter?.id === u.id &&
        (c.status === 'Initiated' || c.status === 'In progress' || c.status === 'Pending')
      ).length;
    });

    this.filteredUnderwriterList.forEach(fu => {
      const match = this.underwriterList.find(u => u.id === fu.id);
      if (match) fu.activeCount = match.activeCount;
    });
  }

  // ✅ Claim search includes: policyholder phone/name/email/id + claim type + claim id + description
  filterClaims(): void {
    const q = (this.claimSearch || '').toLowerCase().trim();

    const filtered = this.claimList.filter((c) => {
      const claimId = c?.id != null ? String(c.id).toLowerCase() : '';
      const desc = c?.description?.toString().toLowerCase() || '';

      // ✅ claim type (insuranceType)
      const claimType = c?.insuranceType?.toString().toLowerCase() || '';

      // ✅ policyholder fields
      const phId = c?.policyholder?.id != null ? String(c.policyholder.id).toLowerCase() : '';
      const phName = c?.policyholder?.username?.toString().toLowerCase() || '';
      const phEmail = c?.policyholder?.email?.toString().toLowerCase() || '';
      const phPhone = c?.policyholder?.phoneNumber != null
        ? String(c.policyholder.phoneNumber).toLowerCase()
        : '';

      return (
        claimId.includes(q) ||
        desc.includes(q) ||
        claimType.includes(q) ||
        phId.includes(q) ||
        phName.includes(q) ||
        phEmail.includes(q) ||
        phPhone.includes(q)
      );
    });

    this.filteredClaimList = this.sortByDateDesc(filtered);
  }

  // ✅ Underwriter search includes phoneNumber too
  filterUnderwriters(): void {
    const q = (this.underwriterSearch || '').toLowerCase().trim();

    this.filteredUnderwriterList = this.underwriterList.filter((u) => {
      const id = u?.id != null ? String(u.id).toLowerCase() : '';
      const name = u?.username?.toString().toLowerCase() || '';
      const email = u?.email?.toString().toLowerCase() || '';
      const phone = u?.phoneNumber != null ? String(u.phoneNumber).toLowerCase() : '';

      return id.includes(q) || name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }

  // Select item
  selectClaim(claim: any) {
    this.itemForm.patchValue({ claimId: claim.id });

    // ✅ include claim type in selected text (small but useful)
    const type = claim?.insuranceType ? ` - ${claim.insuranceType}` : '';
    this.selectedClaimText = `#${claim.id} - ${claim.description}${type}`;

    this.claimDropdownOpen = false;
    this.claimSearch = '';
    this.filteredClaimList = [...this.claimList];
  }

  selectUnderwriter(u: any) {
    this.itemForm.patchValue({ underwriterId: u.id });
    this.selectedUnderwriterText = `#${u.id} - ${u.username}`;
    this.underDropdownOpen = false;

    this.underwriterSearch = '';
    this.filteredUnderwriterList = [...this.underwriterList];
  }

  // Submit
  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.showError = true;
      return;
    }

    this.httpService.AssignClaim(this.itemForm.value).subscribe({
      next: () => {
        this.showMessage = true;
        this.showError = false;
        this.responseMessage = 'Claim assigned successfully';
        this.toastService.show('Claim assigned successfully', 'success');

        this.itemForm.reset({ claimId: null, underwriterId: null });
        this.selectedClaimText = '';
        this.selectedUnderwriterText = '';

        this.getClaims();
      },
      error: (err) => {
        this.showError = true;
        this.showMessage = false;
        this.responseMessage = 'Failed to assign claim';
        this.errorMessage = err;
      }
    });
  }
}