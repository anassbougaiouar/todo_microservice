import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type PlatformEvent = 'users' | 'todos';

@Injectable({
  providedIn: 'root',
})
export class PlatformSyncService {
  private readonly eventsSubject = new Subject<PlatformEvent>();

  readonly events$ = this.eventsSubject.asObservable();

  notify(event: PlatformEvent): void {
    this.eventsSubject.next(event);
  }
}
