import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../environments/environment';
import { LoginRequest, LoginResponse } from '../shared/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly usernameKey = 'todo_username';
  private readonly tokenKey = 'todo_token';
  private readonly userIdKey = 'todo_user_id';

  readonly apiUrl = `${environment.apiBaseUrl}/auth`;
  readonly currentUsername = signal<string | null>(localStorage.getItem(this.usernameKey));
  readonly currentToken = signal<string | null>(localStorage.getItem(this.tokenKey));

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => {
        localStorage.setItem(this.usernameKey, response.username);
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userIdKey, String(response.userId));
        this.currentUsername.set(response.username);
        this.currentToken.set(response.token);
      }),
    );
  }

  getToken(): string | null {
    return this.currentToken();
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    localStorage.removeItem(this.usernameKey);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userIdKey);
    this.currentUsername.set(null);
    this.currentToken.set(null);
  }
}
