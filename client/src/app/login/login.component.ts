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
  roleErr = false;
  selRole = '';

  pwStr = 0;
  pwColor = '#bbb';
  pwLabel = 'Enter a strong password';

  roles = [
    { value: 'POLICYHOLDER', label: 'Policyholder', icon: '🧑' },
    { value: 'ADJUSTER',     label: 'Adjuster',     icon: '📋' },
    { value: 'UNDERWRITER',  label: 'Underwriter',  icon: '📝' },
    { value: 'INVESTIGATOR', label: 'Investigator', icon: '🔍' }
  ];

  private pwPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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
      username: ['', Validators.required],

      phone: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/) // ✅ EXACT SAME VALIDATION
      ]],

      email: ['', [Validators.required, Validators.email]],

      password: ['', [
        Validators.required,
        Validators.pattern(this.pwPattern)
      ]]
    });
  }

  ngOnInit(): void {}

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
        this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.loginLoading = false;
        this.loginErr = 'Invalid username or password';
        setTimeout(() => this.loginErr = '', 3500);
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
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: this.selRole,

      // 🔥 IMPORTANT FIX
      phoneNumber: Number(this.registerForm.value.phone)
    };

    this.httpService.registerUser(payload).subscribe({
      next: () => {
        this.regLoading = false;
        this.regSucc = 'User registered successfully';

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

  private triggerShake(which: 'login' | 'reg'): void {
    if (which === 'login') {
      this.loginShake = true;
      setTimeout(() => this.loginShake = false, 400);
    } else {
      this.regShake = true;
      setTimeout(() => this.regShake = false, 400);
    }
  }
}