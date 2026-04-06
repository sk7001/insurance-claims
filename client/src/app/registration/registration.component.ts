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

  itemForm: FormGroup;
  showMessage = false;
  responseMessage: string = '';
  isError = false;

  constructor(
    public router: Router,
    private bookService: HttpService,
    private formBuilder: FormBuilder,
    private toastService: ToastService
  ) {
    this.itemForm = this.formBuilder.group({
      username: ['', Validators.required],

      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/)
      ]],

      email: ['', [Validators.required, Validators.email]],

      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],

      role: ['', Validators.required]
    });
  }

  ngOnInit(): void { }

  onRegister() {
    this.showMessage = false;
    this.isError = false;

    if (this.itemForm.invalid) {
      return;
    }

    // ✅ Convert phoneNumber to number before sending
    const payload = {
      ...this.itemForm.value,
      phoneNumber: Number(this.itemForm.value.phoneNumber)
    };

    this.bookService.registerUser(payload).subscribe({
      next: () => {
        this.showMessage = true;
        this.isError = false;
        this.responseMessage = 'User registered successfully';
        this.toastService.show('Registered! Please check your email to verify your account.', 'success');
        this.itemForm.reset();
        
        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 1500);
      },
      error: (error) => {
        this.showMessage = true;
        this.isError = true;
        if (error?.error?.message) {
          this.responseMessage = error.error.message;
        } else {
          this.responseMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }
}