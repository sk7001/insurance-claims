import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

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
    private formBuilder: FormBuilder
  ) {
    this.itemForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      email: ['', [Validators.required, Validators.email]],
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

    this.bookService.registerUser(this.itemForm.value).subscribe({
      next: () => {
        this.showMessage = true;
        this.isError = false;
        this.responseMessage = 'Registered successfully';
        this.itemForm.reset();
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