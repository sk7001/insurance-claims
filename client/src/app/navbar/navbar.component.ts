import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  IsLoggin: any = false;
  roleName: string | null = null;
  userName: string | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.IsLoggin = authService.getLoginStatus;
    this.roleName = authService.getRole;
    this.userName = authService.getUsername;
    
    if (this.IsLoggin == false) {
      this.router.navigateByUrl('/login');
    }
  }





  logout() {
    this.authService.logout();
    window.location.reload();
  }
}

