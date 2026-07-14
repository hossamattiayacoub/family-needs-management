import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Family } from '../models/family.model';

@Injectable({ providedIn: 'root' })
export class FamilyService {
  private readonly api = inject(ApiService);

  getFamilies(): Observable<Family[]> {
    return this.api.get<Family[]>('getFamilies');
  }

  addFamily(familyName: string): Observable<Family> {
    return this.api.post<Family>('addFamily', { FamilyName: familyName });
  }

  updateFamily(family: Family): Observable<Family> {
    return this.api.post<Family>('updateFamily', {
      FamilyId: family.FamilyId,
      FamilyName: family.FamilyName
    });
  }

  deleteFamily(familyId: number): Observable<{ FamilyId: number }> {
    return this.api.post<{ FamilyId: number }>('deleteFamily', { FamilyId: familyId });
  }
}
