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

import { FamilyService } from '../../core/services/family.service';
import { NotificationService } from '../../core/services/notification.service';
import { Family } from '../../core/models/family.model';
import { FamilyFormDialogComponent, FamilyDialogData } from './family-form-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData
} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  DetailsDialogComponent,
  DetailsDialogData
} from '../../shared/components/details-dialog/details-dialog.component';

@Component({
  selector: 'app-families',
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
  templateUrl: './families.component.html',
  styleUrl: './families.component.scss'
})
export class FamiliesComponent implements AfterViewInit {
  private readonly familyService = inject(FamilyService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = [
    'FamilyName',
    'GroupName',
    'MobileNo1',
    'MobileNo2',
    'Address',
    'Location',
    'actions'
  ];
  readonly dataSource = new MatTableDataSource<Family>([]);
  readonly isLoaded = signal(false);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    this.loadFamilies();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadFamilies(): void {
    this.familyService.getFamilies().subscribe({
      next: (families) => {
        this.dataSource.data = families;
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
    const ref = this.dialog.open<FamilyFormDialogComponent, FamilyDialogData, Family>(
      FamilyFormDialogComponent,
      { data: { mode: 'add' } }
    );

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.familyService.addFamily(result).subscribe({
        next: () => {
          this.notification.success('Family added successfully');
          this.loadFamilies();
        },
        error: (err: Error) => this.notification.error(err.message)
      });
    });
  }

  openEditDialog(family: Family): void {
    const ref = this.dialog.open<FamilyFormDialogComponent, FamilyDialogData, Family>(
      FamilyFormDialogComponent,
      { data: { mode: 'edit', family } }
    );

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.familyService.updateFamily(result).subscribe({
        next: () => {
          this.notification.success('Family updated successfully');
          this.loadFamilies();
        },
        error: (err: Error) => this.notification.error(err.message)
      });
    });
  }

  openDetailsDialog(family: Family): void {
    const data: DetailsDialogData = {
      title: family.FamilyName,
      subtitle: 'Family Details',
      fields: [
        { label: 'Family Name', value: family.FamilyName },
        { label: 'Group Name', value: family.GroupName },
        { label: 'Mobile No 1', value: family.MobileNo1 },
        { label: 'Mobile No 2', value: family.MobileNo2 },
        { label: 'Address', value: family.Address },
        { label: 'Location', value: family.Location },
        { label: 'Notes', value: family.Notes }
      ]
    };
    this.dialog.open(DetailsDialogComponent, { data, width: '480px', maxWidth: '95vw' });
  }

  openDeleteDialog(family: Family): void {
    const data: ConfirmDialogData = {
      title: 'Delete Family',
      message: `Are you sure you want to delete "${family.FamilyName}"?`
    };
    const ref = this.dialog.open(ConfirmDialogComponent, { data });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.familyService.deleteFamily(family.FamilyId).subscribe({
        next: () => {
          this.notification.success('Family deleted successfully');
          this.loadFamilies();
        },
        error: (err: Error) => this.notification.error(err.message)
      });
    });
  }
}
