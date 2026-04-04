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
  theme: string = 'dark';

  constructor(private authService: AuthService, private router: Router) {
    this.IsLoggin = authService.getLoginStatus;
    this.roleName = authService.getRole;
    this.userName = localStorage.getItem('name') || 'Sneja';
    
    if (this.IsLoggin == false) {
      this.router.navigateByUrl('/login');
    }
  }

  setTheme(t: string) {
    this.theme = t;
    if(t === 'light') document.body.classList.add('light-theme');
    else document.body.classList.remove('light-theme');
  }

  openChat() {
    window.dispatchEvent(new Event('open-chat-bot'));
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }
}

