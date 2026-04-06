import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { ToastService } from '../../services/toast.service';
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  registerForm: FormGroup;
  showRuPw = false;
  regErr = '';
  regSucc = '';
  regLoading = false;
  regShake = false;
  selRole = '';
  roleErr = false;

  pwStr = 0;
  pwColor = '#bbb';
  pwLabel = 'Enter a strong password';

  roles = [
    { value: 'POLICYHOLDER', label: 'Policyholder', icon: '🧑' },
    { value: 'ADJUSTER',     label: 'Adjuster',     icon: '📋' },
    { value: 'UNDERWRITER',  label: 'Underwriter',  icon: '📝' },
    // { value: 'INVESTIGATOR', label: 'Investigator', icon: '🔍' }
  ];

  public pwPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  constructor(
    public router: Router,
    private bookService: HttpService,
    private formBuilder: FormBuilder,
    private toastService: ToastService
  ) {
    this.registerForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      username: ['', Validators.required],

      phone: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/)
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

  ngOnInit(): void { }

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

  private triggerShake(): void {
    this.regShake = true;
    setTimeout(() => this.regShake = false, 400);
  }

  onRegister(): void {
    this.registerForm.markAllAsTouched();

    if (!this.selRole) {
      this.roleErr = true;
    }

    if (this.registerForm.invalid || !this.selRole) {
      this.triggerShake();
      return;
    }

    this.regLoading = true;
    this.regErr = '';
    this.regSucc = '';

    const payload = {
      fullName: this.registerForm.value.fullName,
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: this.selRole,
      phoneNumber: Number(this.registerForm.value.phone)
    };

    this.bookService.registerUser(payload).subscribe({
      next: () => {
        this.regLoading = false;
        this.regSucc = 'Registered! Please check your email to verify your account.';
        this.toastService.show('Registered! Please check your email to verify your account.', 'success');

        this.registerForm.reset();
        this.selRole = '';

        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 1500);
      },
      error: (error: any) => {
        this.regLoading = false;

        if (error?.error?.message) {
          this.regErr = error.error.message;
          this.toastService.show(error.error.message, 'error');
        } else {
          this.regErr = 'Registration failed. Please try again.';
          this.toastService.show('Registration failed. Please try again.', 'error');
        }
        setTimeout(() => this.regErr = '', 4500);
      }
    });
  }
}