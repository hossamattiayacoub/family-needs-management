import { AfterViewInit, Component, ViewChild, computed, inject, signal } from '@angular/core';
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
import { GroupService } from '../../core/services/group.service';
import { NotificationService } from '../../core/services/notification.service';
import { Group } from '../../core/models/group.model';
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
import {
  SearchableSelectComponent,
  SearchableSelectOption
} from '../../shared/components/searchable-select/searchable-select.component';

interface StatusFilterOption {
  label: string;
  value: NeedStatus | 'All';
}

/** Sentinel id for the "All Groups" option — real GroupIds always start at 1. */
const ALL_GROUPS_ID = 0;

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
    MatChipsModule,
    SearchableSelectComponent
  ],
  templateUrl: './family-needs.component.html',
  styleUrl: './family-needs.component.scss'
})
export class FamilyNeedsComponent implements AfterViewInit {
  private readonly familyNeedsService = inject(FamilyNeedsService);
  private readonly groupService = inject(GroupService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = [
    'FamilyName',
    'NeedName',
    'Status',
    'OrderDate',
    'OrderCompletionDate',
    'Notes',
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

  readonly groups = signal<Group[]>([]);
  readonly groupFilterOptions = computed<SearchableSelectOption[]>(() => [
    { id: ALL_GROUPS_ID, label: 'All Groups' },
    ...this.groups().map((g) => ({ id: g.GroupId, label: g.GroupName }))
  ]);
  selectedGroupId: number = ALL_GROUPS_ID;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    this.dataSource.filterPredicate = (row, filter) => {
      const parsed = JSON.parse(filter) as { search: string; status: string; groupId: number };
      const matchesSearch = row.FamilyName.toLowerCase().includes(parsed.search);
      const matchesStatus = parsed.status === 'All' || row.Status === parsed.status;
      const matchesGroup = parsed.groupId === ALL_GROUPS_ID || row.GroupId === parsed.groupId;
      return matchesSearch && matchesStatus && matchesGroup;
    };
    this.loadFamilyNeeds();
    this.loadGroups();
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
        this.applyFilters();
      },
      error: (err: Error) => this.notification.error(err.message)
    });
  }

  loadGroups(): void {
    this.groupService.getGroups().subscribe({
      next: (groups) => this.groups.set(groups),
      error: (err: Error) => this.notification.error(err.message)
    });
  }

  applyFilters(): void {
    this.dataSource.filter = JSON.stringify({
      search: this.searchTerm.trim().toLowerCase(),
      status: this.selectedStatus,
      groupId: this.selectedGroupId
    });
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onSearchChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onGroupFilterChange(groupId: number | null): void {
    this.selectedGroupId = groupId ?? ALL_GROUPS_ID;
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
