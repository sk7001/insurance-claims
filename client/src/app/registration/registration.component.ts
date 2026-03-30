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
  responseMessage: any;

  constructor(
    public router: Router,
    private bookService: HttpService,
    private formBuilder: FormBuilder
  ) {
    this.itemForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {

  }

  onRegister() {
    if (this.itemForm.valid) {
      this.bookService.registerUser(this.itemForm.value).subscribe(
        () => {
          this.showMessage = true;
          this.responseMessage = "Registered successfully";
          this.itemForm.reset();
        }
      )
    }
  }
}

