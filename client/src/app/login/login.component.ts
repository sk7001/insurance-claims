import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { response } from 'express';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  itemForm: FormGroup;
  formModel: any = { username: "", password: "" }
  showError: boolean = false;
  errorMessage: any;

  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.itemForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]]
    });
  }
  ngOnInit(): void {
  }
  onLogin() {
    if (this.itemForm.valid) {
      this.httpService.Login(this.itemForm.value).subscribe({
        next: (data) => {
          console.log(this.itemForm.value);
          this.authService.saveToken(data["token"]);
          this.authService.saveUserId(data["userId"]);
          this.authService.SetRole(data["role"]);
          this.router.navigateByUrl("/dashboard");
        },
        error: (error) => {
          this.showError = true;
          console.log(error);
          this.errorMessage = "Invalid username and password";
          return;
        }
      });
    }
  }

  registration() {
    this.router.navigateByUrl('/registration');
  }
}

