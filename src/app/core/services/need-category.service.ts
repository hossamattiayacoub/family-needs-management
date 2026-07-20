import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { NeedCategory } from '../models/need-category.model';

@Injectable({ providedIn: 'root' })
export class NeedCategoryService {
  private readonly api = inject(ApiService);

  getNeedCategories(): Observable<NeedCategory[]> {
    return this.api.get<NeedCategory[]>('getNeedCategories');
  }

  addNeedCategory(needCategoryName: string): Observable<NeedCategory> {
    return this.api.post<NeedCategory>('addNeedCategory', { NeedCategoryName: needCategoryName });
  }

  updateNeedCategory(category: NeedCategory): Observable<NeedCategory> {
    return this.api.post<NeedCategory>('updateNeedCategory', {
      NeedCategoryId: category.NeedCategoryId,
      NeedCategoryName: category.NeedCategoryName
    });
  }

  deleteNeedCategory(needCategoryId: number): Observable<{ NeedCategoryId: number }> {
    return this.api.post<{ NeedCategoryId: number }>('deleteNeedCategory', {
      NeedCategoryId: needCategoryId
    });
  }
}
