import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-claim',
  templateUrl: './create-claim.component.html',
  styleUrls: ['./create-claim.component.scss']
})
export class CreateClaimComponent implements OnInit {

  itemForm: FormGroup;

  showError = false;
  errorMessage: any;

  showMessage: any;
  responseMessage: any;

  claimList: any[] = [];

  // ✅ Max date = today
  maxDate: string = new Date().toISOString().split('T')[0];

  // ✅ Insurance types list
  insuranceTypes: string[] = [
    'Health Insurance',
    'Life Insurance',
    'Motor / Vehicle Insurance',
    'Home Insurance',
    'Travel Insurance',
    'Property Insurance',
    'Business Insurance',
    'Fire Insurance',
    'Marine Insurance',
    'Personal Accident Insurance'
  ];

  filteredInsuranceTypes: string[] = [];

  insuranceDropdownOpen = false;
  insuranceSearch = '';
  selectedInsuranceText = '';

  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    // ✅ initialize filtered list
    this.filteredInsuranceTypes = [...this.insuranceTypes];

    // ✅ form setup
    this.itemForm = this.formBuilder.group({
      insuranceType: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', [Validators.required, this.futureDateValidator]],
      status: ['Initiated', Validators.required]
    });
  }

  ngOnInit(): void {
    // Optional: initial load of claims
  }

  // ✅ Prevent future dates
  futureDateValidator(control: AbstractControl) {
    if (!control.value) return null;

    const selected = new Date(control.value);
    const today = new Date();

    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selected > today ? { futureDate: true } : null;
  }

  // ✅ Toggle dropdown
  toggleInsuranceDropdown(event: Event) {
    event.stopPropagation(); 
    this.insuranceDropdownOpen = !this.insuranceDropdownOpen;
  }

  // ✅ Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocClick(event: any) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.insuranceDropdownOpen = false;
    }
  }

  // ✅ Filter insurance list
  filterInsuranceTypes() {
    const q = (this.insuranceSearch || '').toLowerCase().trim();
    this.filteredInsuranceTypes = this.insuranceTypes.filter(type =>
      type.toLowerCase().includes(q)
    );
  }

  // ✅ Select insurance
  selectInsuranceType(type: string) {
    this.itemForm.patchValue({ insuranceType: type });
    this.itemForm.get('insuranceType')?.markAsTouched();

    this.selectedInsuranceText = type;
    this.insuranceDropdownOpen = false;

    // reset search
    this.insuranceSearch = '';
    this.filteredInsuranceTypes = [...this.insuranceTypes];
  }

  // ✅ Get claims
  getClaims(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

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

  // ✅ Submit form
  onSubmit(): void {
    this.showError = false;
    this.showMessage = false;

    if (this.itemForm.invalid) {
      this.showError = true;
      this.errorMessage = "Please fill all fields correctly";
      this.itemForm.markAllAsTouched();
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.httpService.createClaims(this.itemForm.value, userId).subscribe({
      next: () => {

        // reset form
        this.itemForm.reset({
          insuranceType: '',
          description: '',
          date: '',
          status: 'Initiated'
        });

        this.selectedInsuranceText = '';
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
  }
}
