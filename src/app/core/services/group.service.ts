import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Group } from '../models/group.model';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private readonly api = inject(ApiService);

  getGroups(): Observable<Group[]> {
    return this.api.get<Group[]>('getGroups');
  }

  addGroup(groupName: string): Observable<Group> {
    return this.api.post<Group>('addGroup', { GroupName: groupName });
  }

  updateGroup(group: Group): Observable<Group> {
    return this.api.post<Group>('updateGroup', {
      GroupId: group.GroupId,
      GroupName: group.GroupName
    });
  }

  deleteGroup(groupId: number): Observable<{ GroupId: number }> {
    return this.api.post<{ GroupId: number }>('deleteGroup', { GroupId: groupId });
  }
}
