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

import { NeedCategoryService } from '../../core/services/need-category.service';
import { NotificationService } from '../../core/services/notification.service';
import { NeedCategory } from '../../core/models/need-category.model';
import {
  NeedCategoryFormDialogComponent,
  NeedCategoryDialogData
} from './need-category-form-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData
} from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-need-category',
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
  templateUrl: './need-category.component.html',
  styleUrl: './need-category.component.scss'
})
export class NeedCategoryComponent implements AfterViewInit {
  private readonly needCategoryService = inject(NeedCategoryService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['NeedCategoryId', 'NeedCategoryName', 'actions'];
  readonly dataSource = new MatTableDataSource<NeedCategory>([]);
  readonly isLoaded = signal(false);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    this.loadNeedCategories();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadNeedCategories(): void {
    this.needCategoryService.getNeedCategories().subscribe({
      next: (categories) => {
        this.dataSource.data = categories;
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
    const ref = this.dialog.open<NeedCategoryFormDialogComponent, NeedCategoryDialogData, NeedCategory>(
      NeedCategoryFormDialogComponent,
      { data: { mode: 'add' } }
    );

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.needCategoryService.addNeedCategory(result.NeedCategoryName).subscribe({
        next: () => {
          this.notification.success('Need category added successfully');
          this.loadNeedCategories();
        },
        error: (err: Error) => this.notification.error(err.message)
      });
    });
  }

  openEditDialog(needCategory: NeedCategory): void {
    const ref = this.dialog.open<NeedCategoryFormDialogComponent, NeedCategoryDialogData, NeedCategory>(
      NeedCategoryFormDialogComponent,
      { data: { mode: 'edit', needCategory } }
    );

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.needCategoryService.updateNeedCategory(result).subscribe({
        next: () => {
          this.notification.success('Need category updated successfully');
          this.loadNeedCategories();
        },
        error: (err: Error) => this.notification.error(err.message)
      });
    });
  }

  openDeleteDialog(needCategory: NeedCategory): void {
    const data: ConfirmDialogData = {
      title: 'Delete Need Category',
      message: `Are you sure you want to delete "${needCategory.NeedCategoryName}"?`
    };
    const ref = this.dialog.open(ConfirmDialogComponent, { data });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.needCategoryService.deleteNeedCategory(needCategory.NeedCategoryId).subscribe({
        next: () => {
          this.notification.success('Need category deleted successfully');
          this.loadNeedCategories();
        },
        error: (err: Error) => this.notification.error(err.message)
      });
    });
  }
}
