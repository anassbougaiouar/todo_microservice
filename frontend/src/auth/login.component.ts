import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../shared/models';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="row justify-content-center">
      <div class="col-md-7 col-lg-5">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h1 class="h4 mb-3">Connexion</h1>
            <p class="text-muted mb-4">Entrez votre nom d'utilisateur et votre mot de passe.</p>

            <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

            <form (ngSubmit)="login()" #loginForm="ngForm">
              <div class="mb-3">
                <label class="form-label">Nom d'utilisateur</label>
                <input
                  type="text"
                  class="form-control form-control-lg"
                  name="username"
                  [(ngModel)]="credentials.username"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Mot de passe</label>
                <input
                  type="password"
                  class="form-control form-control-lg"
                  name="password"
                  [(ngModel)]="credentials.password"
                  required
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100 btn-lg"
                [disabled]="loginForm.invalid || isLoading"
              >
                {{ isLoading ? 'Connexion...' : 'Se connecter' }}
              </button>
            </form>
            <p class="small text-muted mt-3 mb-0">
              Le compte doit deja exister dans la page
              <a routerLink="/users">Utilisateurs</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  credentials: LoginRequest = {
    username: '',
    password: '',
  };

  error = '';
  isLoading = false;

  login(): void {
    this.error = '';
    this.isLoading = true;

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.isLoading = false;
        void this.router.navigateByUrl('/todos');
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message ?? 'Connexion impossible';
      },
    });
  }
}
