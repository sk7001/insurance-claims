import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string | null = null;
  private isLoggedIn: boolean = false;
  id: string | null | undefined;

  constructor() { }

  saveToken(token: string) {
    this.token = token;
    this.isLoggedIn = true;
    localStorage.setItem('token', token);
  }

  SetRole(role: any) {
    localStorage.setItem('role', role);
  }

  get getRole(): string | null {
    return localStorage.getItem('role');
  }

  get getUsername(): string | null {
    return localStorage.getItem('username');
  }

  get getEmail(): string | null {
    return localStorage.getItem('email');
  }

  get getFullName(): string | null {
    return localStorage.getItem('fullName');
  }

  get getLoginStatus(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    this.token = localStorage.getItem('token');
    return this.token;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('fullName');
    this.token = null;
    this.isLoggedIn = false
  }

  saveUsername(username: string) {
    localStorage.setItem('username', username);
  }

  saveEmail(email: string) {
    localStorage.setItem('email', email);
  }

  saveFullName(name: string) {
    localStorage.setItem('fullName', name);
  }

  saveUserId(userid: string) {
    localStorage.setItem('userId', userid);
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }
}
