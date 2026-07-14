import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { FamilyNeed, FamilyNeedFormValue } from '../models/family-need.model';

@Injectable({ providedIn: 'root' })
export class FamilyNeedsService {
  private readonly api = inject(ApiService);

  getFamilyNeeds(): Observable<FamilyNeed[]> {
    return this.api.get<FamilyNeed[]>('getFamilyNeeds');
  }

  addFamilyNeed(value: FamilyNeedFormValue): Observable<FamilyNeed> {
    return this.api.post<FamilyNeed>('addFamilyNeed', {
      FamilyId: value.FamilyId,
      NeedId: value.NeedId,
      Status: value.Status,
      OrderDate: value.OrderDate ?? null,
      OrderCompletionDate: value.OrderCompletionDate ?? null
    });
  }

  updateFamilyNeed(value: FamilyNeedFormValue): Observable<FamilyNeed> {
    return this.api.post<FamilyNeed>('updateFamilyNeed', {
      __row: value.__row,
      FamilyId: value.FamilyId,
      NeedId: value.NeedId,
      Status: value.Status,
      OrderDate: value.OrderDate ?? null,
      OrderCompletionDate: value.OrderCompletionDate ?? null
    });
  }

  deleteFamilyNeed(row: number): Observable<{ __row: number }> {
    return this.api.post<{ __row: number }>('deleteFamilyNeed', { __row: row });
  }
}
