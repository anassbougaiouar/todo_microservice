import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { Todo } from '../shared/models';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly apiUrl = `${environment.apiBaseUrl}/todos`;

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl, this.buildHttpOptions());
  }

  getTodosByUserId(userId: number): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/user/${userId}`, this.buildHttpOptions());
  }

  createTodo(payload: Todo): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, payload, this.buildHttpOptions());
  }

  updateTodo(id: number, payload: Todo): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${id}`, payload, this.buildHttpOptions());
  }

  deleteTodo(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, this.buildHttpOptions());
  }

  private buildHttpOptions(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return { headers };
  }
}
