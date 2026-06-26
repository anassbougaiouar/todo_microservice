import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PlatformSyncService } from '../services/platform-sync.service';
import { UserService } from '../services/user.service';
import { CreateUserRequest, User } from '../shared/models';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="row g-4">
      <div class="col-lg-4">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h1 class="h4 mb-3">Ajouter un utilisateur</h1>

            <div *ngIf="message" class="alert alert-success">{{ message }}</div>
            <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

            <form (ngSubmit)="addUser()" #userForm="ngForm">
              <div class="mb-3">
                <label class="form-label">Nom d'utilisateur</label>
                <input
                  type="text"
                  class="form-control form-control-lg"
                  name="username"
                  [(ngModel)]="newUser.username"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control form-control-lg"
                  name="email"
                  [(ngModel)]="newUser.email"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Mot de passe</label>
                <input
                  type="password"
                  class="form-control form-control-lg"
                  name="password"
                  [(ngModel)]="newUser.password"
                  required
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100"
                [disabled]="userForm.invalid || isSaving"
              >
                {{ isSaving ? 'Ajout...' : 'Ajouter l utilisateur' }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div class="col-lg-8">
          <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h2 class="h5 mb-0">Liste des utilisateurs</h2>
              <button class="btn btn-outline-secondary btn-sm" (click)="loadUsers()">
                Actualiser
              </button>
            </div>

            <div *ngIf="isLoading" class="text-muted">Chargement...</div>

            <div *ngIf="!isLoading && users.length === 0" class="alert alert-light mb-0">
              Aucun utilisateur.
            </div>

            <div *ngIf="!isLoading && users.length > 0" class="list-group">
              <div
                *ngFor="let user of users; let i = index"
                class="list-group-item d-flex justify-content-between align-items-center gap-3"
              >
                <span class="fw-semibold">{{ i + 1 }}</span>
                <span class="text-muted flex-grow-1 text-break">{{ user.email }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class UserListComponent implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly platformSyncService = inject(PlatformSyncService);

  private syncSubscription?: Subscription;

  users: User[] = [];

  newUser: CreateUserRequest = {
    username: '',
    email: '',
    password: '',
  };

  isLoading = false;
  isSaving = false;
  message = '';
  error = '';

  ngOnInit(): void {
    this.loadUsers();

    this.syncSubscription = this.platformSyncService.events$.subscribe((event) => {
      if (event === 'users') {
        this.loadUsers();
      }
    });
  }

  ngOnDestroy(): void {
    this.syncSubscription?.unsubscribe();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = '';

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Impossible de charger la liste des utilisateurs.';
        this.isLoading = false;
      },
    });
  }

  addUser(): void {
    this.isSaving = true;
    this.message = '';
    this.error = '';

    this.userService.createUser(this.newUser).subscribe({
      next: () => {
        this.isSaving = false;
        this.message = 'Utilisateur ajoute.';
        this.newUser = { username: '', email: '', password: '' };
        this.platformSyncService.notify('users');
      },
      error: (error) => {
        this.isSaving = false;
        this.error = error.error?.message ?? "Impossible d'ajouter l'utilisateur.";
      },
    });
  }
}
