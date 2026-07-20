import { AfterViewInit, Component, ViewChild, inject, signal } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';

import { GroupService } from '../../core/services/group.service';
import { NotificationService } from '../../core/services/notification.service';
import { Group } from '../../core/models/group.model';
import { GroupFormDialogComponent, GroupDialogData } from './group-form-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData
} from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss'
})
export class GroupsComponent implements AfterViewInit {
  private readonly groupService = inject(GroupService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['GroupId', 'GroupName', 'actions'];
  readonly dataSource = new MatTableDataSource<Group>([]);
  readonly isLoaded = signal(false);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    this.loadGroups();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadGroups(): void {
    this.groupService.getGroups().subscribe({
      next: (groups) => {
        this.dataSource.data = groups;
        this.isLoaded.set(true);
      },
      error: (err: Error) => this.notification.error(err.message)
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddDialog(): void {
    const ref = this.dialog.open<GroupFormDialogComponent, GroupDialogData, Group>(
      GroupFormDialogComponent,
      { data: { mode: 'add' } }
    );

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.groupService.addGroup(result.GroupName).subscribe({
        next: () => {
          this.notification.success('Group added successfully');
          this.loadGroups();
        },
        error: (err: Error) => this.notification.error(err.message)
      });
    });
  }

  openEditDialog(group: Group): void {
    const ref = this.dialog.open<GroupFormDialogComponent, GroupDialogData, Group>(
      GroupFormDialogComponent,
      { data: { mode: 'edit', group } }
    );

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.groupService.updateGroup(result).subscribe({
        next: () => {
          this.notification.success('Group updated successfully');
          this.loadGroups();
        },
        error: (err: Error) => this.notification.error(err.message)
      });
    });
  }

  openDeleteDialog(group: Group): void {
    const data: ConfirmDialogData = {
      title: 'Delete Group',
      message: `Are you sure you want to delete "${group.GroupName}"?`
    };
    const ref = this.dialog.open(ConfirmDialogComponent, { data });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.groupService.deleteGroup(group.GroupId).subscribe({
        next: () => {
          this.notification.success('Group deleted successfully');
          this.loadGroups();
        },
        error: (err: Error) => this.notification.error(err.message)
      });
    });
  }
}
