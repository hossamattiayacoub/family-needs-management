import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Need, NeedCreate, NeedUpdate } from '../models/need.model';

@Injectable({ providedIn: 'root' })
export class NeedService {
  private readonly api = inject(ApiService);

  getNeeds(): Observable<Need[]> {
    return this.api.get<Need[]>('getNeeds');
  }

  addNeed(payload: NeedCreate): Observable<Need> {
    return this.api.post<Need>('addNeed', {
      NeedName: payload.NeedName,
      NeedCategoryId: payload.NeedCategoryId
    });
  }

  updateNeed(payload: NeedUpdate): Observable<Need> {
    return this.api.post<Need>('updateNeed', {
      NeedId: payload.NeedId,
      NeedName: payload.NeedName,
      NeedCategoryId: payload.NeedCategoryId
    });
  }

  deleteNeed(needId: number): Observable<{ NeedId: number }> {
    return this.api.post<{ NeedId: number }>('deleteNeed', { NeedId: needId });
  }
}
