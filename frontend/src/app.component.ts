import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="app-shell border-bottom">
      <nav class="navbar navbar-expand-lg">
        <div class="container py-2">
          <a class="navbar-brand fw-bold text-dark" routerLink="/login">
            Mini TODO
          </a>

          <div class="d-flex align-items-center gap-2 flex-wrap">
            <a class="btn btn-sm nav-btn" routerLink="/login" routerLinkActive="active-link">
              Connexion
            </a>
            <a class="btn btn-sm nav-btn" routerLink="/users" routerLinkActive="active-link">
              Utilisateurs
            </a>
            <a class="btn btn-sm nav-btn" routerLink="/todos" routerLinkActive="active-link">
              Taches
            </a>

            <button
              *ngIf="currentUsername()"
              type="button"
              class="btn btn-sm btn-outline-dark"
              (click)="logout()"
            >
              Se deconnecter
            </button>
          </div>
        </div>
      </nav>
    </header>

    <main class="container py-4">
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUsername = this.authService.currentUsername;

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
