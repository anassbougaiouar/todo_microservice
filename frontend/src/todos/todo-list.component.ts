import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { PlatformSyncService } from '../services/platform-sync.service';
import { TodoService } from '../services/todo.service';
import { UserService } from '../services/user.service';
import { Todo, User } from '../shared/models';

@Component({
  selector: 'app-todo-list',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="row g-4">
      <div class="col-lg-4">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h1 class="h4 mb-3">
              {{ editingTodoId ? 'Modifier la tache' : 'Nouvelle tache' }}
            </h1>

            <div *ngIf="message" class="alert alert-success">{{ message }}</div>
            <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
            

            <form (ngSubmit)="saveTodo()" #todoForm="ngForm">
              <div class="mb-3">
                <label class="form-label">Titre</label>
                <input
                  type="text"
                  class="form-control form-control-lg"
                  name="title"
                  [(ngModel)]="formTodo.title"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea
                  class="form-control"
                  rows="3"
                  name="description"
                  [(ngModel)]="formTodo.description"
                ></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Utilisateur</label>
                <select
                  class="form-select"
                  name="userId"
                  [(ngModel)]="formTodo.userId"
                  required
                >
                  <option [ngValue]="null">Choisir un utilisateur</option>
                  <option *ngFor="let user of users" [ngValue]="user.id">
                    {{ user.username }}
                  </option>
                </select>
              </div>

              <div class="form-check mb-3">
                <input
                  id="completed"
                  type="checkbox"
                  class="form-check-input"
                  name="completed"
                  [(ngModel)]="formTodo.completed"
                />
                <label class="form-check-label" for="completed">Tache terminee</label>
              </div>

              <div class="d-flex gap-2">
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="todoForm.invalid || isSaving"
                >
                  {{
                    isSaving
                      ? 'Enregistrement...'
                      : editingTodoId
                        ? 'Enregistrer'
                        : 'Ajouter'
                  }}
                </button>

                <button
                  *ngIf="editingTodoId"
                  type="button"
                  class="btn btn-outline-secondary"
                  (click)="cancelEdit()"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3">
              <h2 class="h5 mb-0">Taches</h2>

              <div class="d-flex gap-2 flex-wrap">
                <select
                  class="form-select form-select-sm"
                  style="min-width: 220px;"
                  [(ngModel)]="selectedUserFilter"
                  (ngModelChange)="loadTodos()"
                  name="selectedUserFilter"
                >
                  <option value="all">Tous les utilisateurs</option>
                  <option *ngFor="let user of users" [value]="user.id">
                    {{ user.username }}
                  </option>
                </select>

                <button class="btn btn-outline-secondary btn-sm" (click)="loadTodos()">
                  Actualiser
                </button>
              </div>
            </div>

            <div *ngIf="isLoading" class="text-muted">Chargement...</div>

            <div *ngIf="!isLoading && todos.length === 0" class="alert alert-light mb-0">
              Aucune tache.
            </div>

            <div *ngIf="!isLoading && todos.length > 0" class="list-group">
              <div *ngFor="let todo of todos" class="list-group-item">
                <div class="d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <div class="fw-semibold" [class.text-decoration-line-through]="todo.completed">
                      {{ todo.title }}
                    </div>
                    <div class="small text-muted mb-2">
                      {{ todo.description || 'Pas de description' }}
                    </div>
                    <div class="small text-muted">
                      {{ getUsername(todo.userId) }}
                    </div>
                  </div>

                  <div class="d-flex flex-column gap-2">
                    <button
                      class="btn btn-sm"
                      [class.btn-outline-success]="!todo.completed"
                      [class.btn-success]="todo.completed"
                      (click)="toggleCompleted(todo)"
                    >
                      {{ todo.completed ? 'Terminee' : 'Terminer' }}
                    </button>
                    <button class="btn btn-sm btn-outline-primary" (click)="startEdit(todo)">
                      Modifier
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteTodo(todo.id)">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TodoListComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly todoService = inject(TodoService);
  private readonly userService = inject(UserService);
  private readonly platformSyncService = inject(PlatformSyncService);

  private syncSubscription?: Subscription;

  todos: Todo[] = [];
  users: User[] = [];
  formTodo: Todo = this.createEmptyTodo();
  editingTodoId: number | null = null;
  selectedUserFilter = 'all';

  isLoading = false;
  isSaving = false;
  message = '';
  error = '';

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      void this.router.navigateByUrl('/login');
      return;
    }

    this.loadInitialData();

    this.syncSubscription = this.platformSyncService.events$.subscribe((event) => {
      if (event === 'users') {
        this.loadUsers();
      }

      if (event === 'todos') {
        this.loadTodos();
      }
    });
  }

  ngOnDestroy(): void {
    this.syncSubscription?.unsubscribe();
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.error = '';

    forkJoin({
      users: this.userService.getUsers(),
      todos: this.todoService.getTodos(),
    }).subscribe({
      next: (response) => {
        this.users = response.users;
        this.todos = response.todos;
        if (this.users.length > 0 && !this.formTodo.userId) {
          this.formTodo.userId = this.users[0].id ?? null;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.handleRequestError(error, 'Impossible de charger la page.');
        this.isLoading = false;
      },
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;

        if (
          this.selectedUserFilter !== 'all' &&
          !this.users.some((user) => String(user.id) === this.selectedUserFilter)
        ) {
          this.selectedUserFilter = 'all';
          this.loadTodos();
        }

        if (!this.users.some((user) => user.id === this.formTodo.userId)) {
          this.formTodo.userId = this.users[0]?.id ?? null;
        }
      },
      error: (error) => {
        if (error.status === 401) {
          this.handleRequestError(error, 'Connexion requise');
          return;
        }

        this.users = [];
      },
    });
  }

  loadTodos(): void {
    this.isLoading = true;
    this.error = '';

    const request =
      this.selectedUserFilter === 'all'
        ? this.todoService.getTodos()
        : this.todoService.getTodosByUserId(Number(this.selectedUserFilter));

    request.subscribe({
      next: (todos) => {
        this.todos = todos;
        this.isLoading = false;
      },
      error: (error) => {
        this.handleRequestError(error, 'Impossible de charger les taches.');
        this.isLoading = false;
      },
    });
  }

  saveTodo(): void {
    this.isSaving = true;
    this.message = '';
    this.error = '';

    const payload: Todo = {
      ...this.formTodo,
      title: this.formTodo.title.trim(),
      description: this.formTodo.description.trim(),
      userId: Number(this.formTodo.userId),
    };

    const request = this.editingTodoId
      ? this.todoService.updateTodo(this.editingTodoId, payload)
      : this.todoService.createTodo(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.message = this.editingTodoId
          ? 'Tache mise a jour.'
          : 'Tache enregistree.';
        this.cancelEdit();
        this.platformSyncService.notify('todos');
      },
      error: (error) => {
        this.isSaving = false;
        this.handleRequestError(error, "Impossible d'enregistrer la tache.");
      },
    });
  }

  startEdit(todo: Todo): void {
    this.message = '';
    this.error = '';
    this.editingTodoId = todo.id ?? null;
    this.formTodo = {
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      userId: todo.userId,
    };
  }

  cancelEdit(): void {
    this.editingTodoId = null;
    this.formTodo = this.createEmptyTodo();
  }

  toggleCompleted(todo: Todo): void {
    if (!todo.id) {
      return;
    }

    this.message = '';
    this.error = '';

    this.todoService
      .updateTodo(todo.id, { ...todo, completed: !todo.completed })
      .subscribe({
        next: () => {
          this.message = 'Etat mis a jour.';
          this.platformSyncService.notify('todos');
        },
        error: (error) => {
          this.handleRequestError(error, "Impossible de mettre a jour l'etat.");
        },
      });
  }

  deleteTodo(id?: number): void {
    if (!id) {
      return;
    }

    this.message = '';
    this.error = '';

    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.message = 'Tache supprimee.';
        this.platformSyncService.notify('todos');
      },
      error: (error) => {
        this.handleRequestError(error, 'Impossible de supprimer la tache.');
      },
    });
  }

  private createEmptyTodo(): Todo {
    return {
      title: '',
      description: '',
      completed: false,
      userId: null,
    };
  }

  getUsername(userId: number | null): string {
    if (userId === null) {
      return 'Utilisateur inconnu';
    }

    return this.users.find((user) => user.id === userId)?.username ?? `Utilisateur ${userId}`;
  }

  private handleRequestError(error: { status?: number }, fallbackMessage: string): void {
    if (error.status === 401) {
      this.authService.logout();
      void this.router.navigateByUrl('/login');
      return;
    }

    this.error = fallbackMessage;
  }
}
