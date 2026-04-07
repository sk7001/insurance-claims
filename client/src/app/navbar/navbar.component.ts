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
  fullName: string | null = null;
  isCollapsed: boolean = false;

  constructor(private authService: AuthService, private router: Router) {
    this.IsLoggin = authService.getLoginStatus;
    this.roleName = authService.getRole;
    this.userName = authService.getUsername;
    this.fullName = authService.getFullName;
    
    if (this.IsLoggin == false) {
      this.router.navigateByUrl('/login');
    }
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }
}
