import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'user_token'; 
  private readonly ROLE_KEY = 'user_role';
  private loggedIn = false;

  constructor() {
    this.checkLoginStatus();
  }

  login(email: string, password: string): boolean {
    if (email === 'admin@example.com' && password === 'admin1234') {
      this.loggedIn = true;
      localStorage.setItem(this.TOKEN_KEY, 'true');
      localStorage.setItem(this.ROLE_KEY, 'admin');
      return true;
    } else if (email === 'user@example.com' && password === 'user1234') {
      this.loggedIn = true;
      localStorage.setItem(this.TOKEN_KEY, 'true');
      localStorage.setItem(this.ROLE_KEY, 'user');
      return true;
    }
    return false;
  }

  logout() {
    this.loggedIn = false;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  getRole(): string {
    return localStorage.getItem(this.ROLE_KEY) || '';
  }

  private checkLoginStatus() {
    this.loggedIn = localStorage.getItem(this.TOKEN_KEY) === 'true';
  }
}
