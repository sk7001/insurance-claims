import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  userId: string | null;
  loading = false;
  saving = false;
  successMsg = '';
  errorMsg = '';
  userRole = '';

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {
    this.userId = this.authService.getUserId();
    this.userRole = this.authService.getRole || 'USER';

    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      email: [{ value: '', disabled: true }], // Email is read-only
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    if (!this.userId) return;
    this.loading = true;
    this.httpService.getUserProfile(this.userId).subscribe({
      next: (user: any) => {
        this.profileForm.patchValue({
          fullName: user.fullName || '',
          username: user.username || '',
          email: user.email || '',
          phone: user.phoneNumber ? String(user.phoneNumber) : ''
        });
        // Also update the role from the API response if available
        if (user.role) {
          this.userRole = user.role;
        }
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load profile details.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.userId) return;

    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    const payload = {
      fullName: this.profileForm.value.fullName,
      username: this.profileForm.value.username,
      phoneNumber: this.profileForm.value.phone
    };

    this.httpService.updateProfile(this.userId, payload).subscribe({
      next: (user: any) => {
        this.saving = false;
        this.successMsg = 'Profile updated successfully! ✅';

        // ✅ Store updated values in local storage
        // Option 1: Use API response (best)
        this.authService.saveUser(user);

        // ✅ If API doesn't return full user properly, fallback using form values
        if (!user) {
          this.authService.saveFullName(this.profileForm.value.fullName);
          this.authService.saveUsername(this.profileForm.value.username);
          this.authService.savePhoneNumber(this.profileForm.value.phone);
        }
      },
      error: (err: any) => {
        this.saving = false;
        this.errorMsg = err.error?.message || 'Failed to update profile.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashbaord']);
  }
}
