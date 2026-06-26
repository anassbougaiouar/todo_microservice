import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login.component';
import { TodoListComponent } from './todos/todo-list.component';
import { UserListComponent } from './users/user-list.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'users', component: UserListComponent },
  { path: 'todos', component: TodoListComponent },
  { path: '**', redirectTo: 'login' },
];
