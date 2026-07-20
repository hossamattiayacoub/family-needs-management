import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Family, FamilyCreate, FamilyUpdate } from '../models/family.model';

@Injectable({ providedIn: 'root' })
export class FamilyService {
  private readonly api = inject(ApiService);

  getFamilies(): Observable<Family[]> {
    return this.api.get<Family[]>('getFamilies');
  }

  addFamily(payload: FamilyCreate): Observable<Family> {
    return this.api.post<Family>('addFamily', {
      FamilyName: payload.FamilyName,
      GroupId: payload.GroupId,
      MobileNo1: payload.MobileNo1 ?? '',
      MobileNo2: payload.MobileNo2 ?? '',
      Address: payload.Address ?? '',
      Location: payload.Location ?? '',
      Notes: payload.Notes ?? ''
    });
  }

  updateFamily(payload: FamilyUpdate): Observable<Family> {
    return this.api.post<Family>('updateFamily', {
      FamilyId: payload.FamilyId,
      FamilyName: payload.FamilyName,
      GroupId: payload.GroupId,
      MobileNo1: payload.MobileNo1 ?? '',
      MobileNo2: payload.MobileNo2 ?? '',
      Address: payload.Address ?? '',
      Location: payload.Location ?? '',
      Notes: payload.Notes ?? ''
    });
  }

  deleteFamily(familyId: number): Observable<{ FamilyId: number }> {
    return this.api.post<{ FamilyId: number }>('deleteFamily', { FamilyId: familyId });
  }
}
