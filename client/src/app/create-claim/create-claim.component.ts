import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { SpeechService } from '../../services/speech.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-claim',
  templateUrl: './create-claim.component.html',
  styleUrls: ['./create-claim.component.scss']
})
export class CreateClaimComponent implements OnInit, OnDestroy {

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

  isRecording = false;
  private speechSub: Subscription | null = null;

  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    public speechService: SpeechService
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
    // ✅ Listen for speech transcripts
    this.speechSub = this.speechService.getTranscript().subscribe((text: string) => {
      const current = this.itemForm.get('description')?.value || '';
      this.itemForm.patchValue({
        description: current + (current ? ' ' : '') + text
      });
    });
  }

  ngOnDestroy(): void {
    if (this.speechSub) {
      this.speechSub.unsubscribe();
    }
    this.speechService.stop();
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

  toggleSpeechRecording() {
    if (!this.speechService.isSupported()) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (this.isRecording) {
      this.speechService.stop();
      this.isRecording = false;
    } else {
      this.speechService.start();
      this.isRecording = true;
    }
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
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.httpService.getClaimsByPolicyholder(userId).subscribe({
      next: (res: any) => {
        this.claimList = res;
      },
      error: (err: any) => {
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

    const userId = this.authService.getUserId();
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

        this.toastService.show("Claim created successfully", "success");

        setTimeout(() => {
          this.router.navigateByUrl('/view-claim-status');
        }, 1500);
      },
      error: (err: any) => {
        this.showError = true;
        this.errorMessage = err;
      }
    });
  }
}
