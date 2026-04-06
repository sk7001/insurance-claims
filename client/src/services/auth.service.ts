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

  // ✅ NEW: phone getter
  get getPhoneNumber(): string | null {
    return localStorage.getItem('phoneNumber');
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
    localStorage.removeItem('phoneNumber'); // ✅ NEW
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

  // ✅ NEW: save phone
  savePhoneNumber(phoneNumber: string) {
    localStorage.setItem('phoneNumber', phoneNumber);
  }

  saveUserId(userid: string) {
    localStorage.setItem('userId', userid);
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  // ✅ OPTIONAL (but very useful): save all in one shot
  saveUser(user: any) {
    if (!user) return;
    if (user.username) this.saveUsername(user.username);
    if (user.fullName) this.saveFullName(user.fullName);
    if (user.email) this.saveEmail(user.email);
    if (user.role) this.SetRole(user.role);

    // phone can come as phone or phoneNumber
    const phone = user.phoneNumber ?? user.phone;
    if (phone !== undefined && phone !== null) {
      this.savePhoneNumber(String(phone));
    }
  }
}