import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { response } from 'express';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  IsLoggin: any = false;
  roleName: string | null;
  constructor(private authService: AuthService, private router: Router) {

    this.IsLoggin = authService.getLoginStatus;
    this.roleName = authService.getRole;
    if (this.IsLoggin == false) {
      this.router.navigateByUrl('/login');
    }
  }
  logout() {
    this.authService.logout();
    window.location.reload();
  }
}

