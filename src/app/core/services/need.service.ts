import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Need } from '../models/need.model';

@Injectable({ providedIn: 'root' })
export class NeedService {
  private readonly api = inject(ApiService);

  getNeeds(): Observable<Need[]> {
    return this.api.get<Need[]>('getNeeds');
  }

  addNeed(needName: string): Observable<Need> {
    return this.api.post<Need>('addNeed', { NeedName: needName });
  }

  updateNeed(need: Need): Observable<Need> {
    return this.api.post<Need>('updateNeed', {
      NeedId: need.NeedId,
      NeedName: need.NeedName
    });
  }

  deleteNeed(needId: number): Observable<{ NeedId: number }> {
    return this.api.post<{ NeedId: number }>('deleteNeed', { NeedId: needId });
  }
}
