import { AfterViewInit, Component, ViewChild, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';

import { FamilyNeedsService } from '../../core/services/family-needs.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  FamilyNeed,
  FamilyNeedFormValue,
  NEED_STATUS_VALUES,
  NeedStatus
} from '../../core/models/family-need.model';
import {
  FamilyNeedFormDialogComponent,
  FamilyNeedDialogData
} from './family-need-form-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData
} from '../../shared/components/confirm-dialog/confirm-dialog.component';

interface StatusFilterOption {
  label: string;
  value: NeedStatus | 'All';
}

@Component({
  selector: 'app-family-needs',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './family-needs.component.html',
  styleUrl: './family-needs.component.scss'
})
export class FamilyNeedsComponent implements AfterViewInit {
  private readonly familyNeedsService = inject(FamilyNeedsService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = [
    'FamilyName',
    'NeedName',
    'Status',
    'OrderDate',
    'OrderCompletionDate',
    'actions'
  ];
  readonly dataSource = new MatTableDataSource<FamilyNeed>([]);
  readonly isLoaded = signal(false);

  readonly statusOptions: StatusFilterOption[] = [
    { label: 'All Statuses', value: 'All' },
    ...NEED_STATUS_VALUES.map((s) => ({ label: s, value: s }))
  ];
  selectedStatus: NeedStatus | 'All' = 'All';
  searchTerm = '';

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    this.dataSource.filterPredicate = (row, filter) => {
      const parsed = JSON.parse(filter) as { search: string; status: string };
      const matchesSearch = row.FamilyName.toLowerCase().includes(parsed.search);
      const matchesStatus = parsed.status === 'All' || row.Status === parsed.status;
      return matchesSearch && matchesStatus;
    };
    this.loadFamilyNeeds();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadFamilyNeeds(): void {
    this.familyNeedsService.getFamilyNeeds().subscribe({
      next: (records) => {
        this.dataSource.data = records;
        this.isLoaded.set(true);
      },
      error: (err: Error) => this.notification.error(err.message)
    });
  }

  applyFilters(): void {
    this.dataSource.filter = JSON.stringify({
      search: this.searchTerm.trim().toLowerCase(),
      status: this.selectedStatus
    });
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onSearchChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  openAddDialog(): void {
    const ref = this.dialog.open<FamilyNeedFormDialogComponent, FamilyNeedDialogData, FamilyNeedFormValue>(
      FamilyNeedFormDialogComponent,
      { data: { mode: 'add' } }
    );

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.familyNeedsService.addFamilyNeed(result).subscribe({
        next: () => {
          this.notification.success('Family need added successfully');
          this.loadFamilyNeeds();
        },
        error: (err: Error) => this.notification.error(err.message)
      });
    });
  }

  openEditDialog(familyNeed: FamilyNeed): void {
    const ref = this.dialog.open<FamilyNeedFormDialogComponent, FamilyNeedDialogData, FamilyNeedFormValue>(
      FamilyNeedFormDialogComponent,
      { data: { mode: 'edit', familyNeed } }
    );

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.familyNeedsService.updateFamilyNeed(result).subscribe({
        next: () => {
          this.notification.success('Family need updated successfully');
          this.loadFamilyNeeds();
        },
        error: (err: Error) => this.notification.error(err.message)
      });
    });
  }

  openDeleteDialog(familyNeed: FamilyNeed): void {
    const data: ConfirmDialogData = {
      title: 'Delete Family Need',
      message: `Remove the "${familyNeed.NeedName}" need for "${familyNeed.FamilyName}"?`
    };
    const ref = this.dialog.open(ConfirmDialogComponent, { data });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed || familyNeed.__row === undefined) return;
      this.familyNeedsService.deleteFamilyNeed(familyNeed.__row).subscribe({
        next: () => {
          this.notification.success('Family need deleted successfully');
          this.loadFamilyNeeds();
        },
        error: (err: Error) => this.notification.error(err.message)
      });
    });
  }
}
