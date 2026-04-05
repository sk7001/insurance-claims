import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  isRegMode = false;
  showIntro = true;

  loginForm: FormGroup;
  showLiPw = false;
  loginErr = '';
  loginLoading = false;
  loginShake = false;

  registerForm: FormGroup;
  showRuPw = false;
  regErr = '';
  regSucc = '';
  regLoading = false;
  regShake = false;
  selRole = '';
  roleErr = false;

  // FORGOT PASSWORD STATE
  isForgotMode = false;
  forgotStep = 1; 
  forgotEmail = '';
  newPassword = '';
  confirmPassword = '';
  forgotErr = '';
  forgotSucc = '';
  forgotLoading = false;
  forgotShake = false;
  otpDigits: string[] = ['', '', '', '', '', ''];

  pwStr = 0;
  pwColor = '#bbb';
  pwLabel = 'Enter a strong password';

  roles = [
    { value: 'POLICYHOLDER', label: 'Policyholder', icon: '🧑' },
    { value: 'ADJUSTER',     label: 'Adjuster',     icon: '📋' },
    { value: 'UNDERWRITER',  label: 'Underwriter',  icon: '📝' },
    { value: 'INVESTIGATOR', label: 'Investigator', icon: '🔍' }
  ];

  public pwPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private httpService: HttpService,
    private authService: AuthService
  ) {

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // ✅ UPDATED (MATCHES YOUR REFERENCE CODE)
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', Validators.required],

      phone: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/) // ✅ EXACT SAME VALIDATION
      ]],

      email: ['', [Validators.required, Validators.email]],

      password: ['', [
        Validators.required,
        Validators.pattern(this.pwPattern)
      ]],
      confirmPassword: ['', Validators.required]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  ngOnInit(): void {}

  passwordMatchValidator(form: any) {
    const p = form.get('password')?.value;
    const cp = form.get('confirmPassword')?.value;
    return p === cp ? null : { mismatch: true };
  }

  isInv(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c?.invalid && (c?.touched || c?.dirty));
  }

  isOk(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c?.valid && (c?.touched || c?.dirty));
  }

  // ✅ STRICT PHONE INPUT (ONLY 10 DIGITS)
  onPhoneInput(e: any): void {
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 10);
    e.target.value = val;
    this.registerForm.get('phone')?.setValue(val, { emitEvent: false });
  }

  setRole(val: string): void {
    this.selRole = val;
    this.roleErr = false;
  }

  onPwInput(e: any): void {
    const v = e.target.value;
    const s = [v.length>=8,/[A-Z]/.test(v),/[a-z]/.test(v),/\d/.test(v),/[@$!%*?&]/.test(v)].filter(Boolean).length;
    const c = ['#e63350','#e63350','#f4a261','#fbbf24','#22c55e','#16a34a'];
    const l = ['Too short','Weak','Fair','Good','Strong','Very strong'];
    this.pwStr = s;
    this.pwColor = c[s];
    this.pwLabel = l[s];
  }

  addRipple(e: MouseEvent): void {
    const btn = e.currentTarget as HTMLElement;
    const r = document.createElement('span');
    r.className = 'ripple';
    const rc = btn.getBoundingClientRect(), sz = Math.max(rc.width, rc.height);
    r.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX-rc.left-sz/2}px;top:${e.clientY-rc.top-sz/2}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 500);
  }

  // LOGIN (UNCHANGED)
  onLogin(): void {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      this.triggerShake('login');
      return;
    }

    this.loginLoading = true;
    this.loginErr = '';

    this.httpService.Login(this.loginForm.value).subscribe({
      next: (data: any) => {
        this.authService.saveToken(data.token);
        this.authService.saveUserId(data.userId);
        this.authService.SetRole(data.role);
        this.authService.saveUsername(data.username);
        this.authService.saveEmail(data.email);
        this.authService.saveFullName(data.fullName);
        this.router.navigateByUrl('/dashbaord');
      },
      error: (error: any) => {
        this.loginLoading = false;
        if (error?.error?.message) {
          this.loginErr = error.error.message;
        } else {
          this.loginErr = 'Invalid username or password';
        }
        this.triggerShake('login');
        setTimeout(() => this.loginErr = '', 4500);
      }
    });
  }

  /* =========================
     FORGOT PASSWORD LOGIC
  ========================= */
   toggleForgot(val: boolean): void {
     this.isForgotMode = val;
     this.forgotStep = 1;
     this.forgotErr = '';
     this.forgotSucc = '';
     this.forgotEmail = '';
     this.newPassword = '';
     this.confirmPassword = '';
     this.otpDigits = ['', '', '', '', '', ''];
     
     // Reset strength meter
     this.pwStr = 0;
     this.pwColor = '#bbb';
     this.pwLabel = '';
   }
 
   onForgotSubmit(): void {
     if (!this.forgotEmail || !this.forgotEmail.includes('@')) {
       this.forgotErr = 'Please enter a valid email address';
       return;
     }
     this.forgotEmail = this.forgotEmail.toLowerCase().trim();
 
     this.forgotLoading = true;
     this.forgotErr = '';
     this.forgotSucc = '';
 
     this.httpService.requestOtp(this.forgotEmail).subscribe({
       next: (res: any) => {
         this.forgotLoading = false;
         this.forgotSucc = 'A 6-digit code has been sent to your email! ✅';
         this.forgotStep = 2; // Move to OTP verification step
         this.otpDigits = ['', '', '', '', '', ''];
         setTimeout(() => {
           const first = document.getElementById('otp-0');
           if (first) first.focus();
         }, 100);
       },
       error: (err: any) => {
         this.forgotLoading = false;
         this.forgotErr = err.error?.message || 'Email not found in our records';
       }
     });
   }

  onOtpInput(event: any, index: number): void {
    // FALLBACK for mobile/software keyboards if keydown doesn't intercept
    const val = event.target.value;
    if (val && !this.otpDigits[index]) {
      this.otpDigits[index] = val.slice(-1);
      this.focusNext(index);
    }
    event.target.value = this.otpDigits[index]; // Keep DOM in sync
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    const key = event.key;

    // 1. Handle Digits (0-9)
    if (/^[0-9]$/.test(key)) {
      event.preventDefault(); // Stop browser from "typing" it naturally
      this.otpDigits[index] = key;
      this.focusNext(index);
      return;
    }

    // 2. Handle Backspace
    if (key === 'Backspace') {
      event.preventDefault();
      if (this.otpDigits[index]) {
        this.otpDigits[index] = '';
      } else if (index > 0) {
        this.otpDigits[index - 1] = '';
        this.focusPrev(index);
      }
      return;
    }

    // 3. Handle Arrows
    if (key === 'ArrowLeft') {
      event.preventDefault();
      this.focusPrev(index);
    } else if (key === 'ArrowRight') {
      event.preventDefault();
      this.focusNext(index);
    }
  }

  private focusNext(index: number): void {
    if (index < 5) {
      setTimeout(() => {
        const next = document.getElementById(`otp-${index + 1}`);
        if (next) (next as HTMLInputElement).focus();
      }, 0);
    }
  }

  private focusPrev(index: number): void {
    if (index > 0) {
      setTimeout(() => {
        const prev = document.getElementById(`otp-${index - 1}`);
        if (prev) (prev as HTMLInputElement).focus();
      }, 0);
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const data = event.clipboardData?.getData('text');
    if (data) {
      const digits = data.replace(/\D/g, '').slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        this.otpDigits[i] = digits[i] || '';
      }
      // Focus the last filled box or the next empty one
      const targetIdx = Math.min(digits.length, 5);
      const target = document.getElementById(`otp-${targetIdx}`);
      if (target) (target as HTMLInputElement).focus();
    }
  }

  onVerifyOtp(): void {
    const otp = this.otpDigits.join('');
    if (otp.length !== 6) {
      this.forgotErr = 'Please enter all 6 digits';
      return;
    }

    this.forgotLoading = true;
    this.forgotErr = '';
    this.forgotSucc = '';

    this.httpService.verifyOtpOnly(this.forgotEmail, otp).subscribe({
      next: (res: any) => {
        this.forgotLoading = false;
        this.forgotSucc = 'Code verified! Please set your new password. 🛡️';
        this.forgotStep = 3;
      },
      error: (err: any) => {
        this.forgotLoading = false;
        this.forgotErr = err.error?.message || 'Invalid or expired code';
      }
    });
  }

   onResetSubmit(): void {
     // Validate Strength
     if (!this.pwPattern.test(this.newPassword)) {
       this.forgotErr = 'New password must have 8+ characters, uppercase, lowercase, number, and special character 🛡️';
       this.triggerShake('forgot');
       return;
     }

     if (this.newPassword !== this.confirmPassword) {
       this.forgotErr = 'Passwords do not match';
       this.triggerShake('forgot');
       return;
     }
 
     this.forgotLoading = true;
     this.forgotErr = '';
     this.forgotSucc = '';
 
     const payload = {
       email: this.forgotEmail.toLowerCase().trim(),
       otp: this.otpDigits.join(''),
       newPassword: this.newPassword
     };
 
     this.httpService.verifyReset(payload).subscribe({
       next: (res: any) => {
         this.forgotLoading = false;
         this.forgotSucc = 'Password reset successfully! Redirecting... ✅';
         setTimeout(() => this.toggleForgot(false), 3000);
       },
       error: (err: any) => {
         this.forgotLoading = false;
         this.forgotErr = err.error?.message || 'Verification failed. Please check the code or try again.';
         this.triggerShake('forgot');
       }
     });
   }


  // ✅ FULLY FIXED REGISTER (BASED ON YOUR REFERENCE)
  onRegister(): void {

    this.registerForm.markAllAsTouched();

    if (!this.selRole) {
      this.roleErr = true;
    }

    if (this.registerForm.invalid || !this.selRole) {
      this.triggerShake('reg');
      return;
    }

    this.regLoading = true;
    this.regErr = '';
    this.regSucc = '';

    // ✅ EXACT SAME PAYLOAD LOGIC
    const payload = {
      fullName: this.registerForm.value.fullName,
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: this.selRole,
      phoneNumber: Number(this.registerForm.value.phone)
    };

    this.httpService.registerUser(payload).subscribe({
      next: () => {
        this.regLoading = false;
        this.regSucc = 'Registered! Please check your email to verify your account.';

        this.registerForm.reset();
        this.selRole = '';

        setTimeout(() => {
          this.regSucc = '';
          this.isRegMode = false;
        }, 1800);
      },
      error: (error: any) => {
        this.regLoading = false;

        if (error?.error?.message) {
          this.regErr = error.error.message;
        } else {
          this.regErr = 'Registration failed. Please try again.';
        }

        setTimeout(() => this.regErr = '', 4000);
      }
    });
  }

   private triggerShake(which: 'login' | 'reg' | 'forgot'): void {
     if (which === 'login') {
       this.loginShake = true;
       setTimeout(() => this.loginShake = false, 400);
     } else if (which === 'reg') {
       this.regShake = true;
       setTimeout(() => this.regShake = false, 400);
     } else {
       this.forgotShake = true;
       setTimeout(() => this.forgotShake = false, 400);
     }
   }
}