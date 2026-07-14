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

import { NeedService } from '../../core/services/need.service';
import { NotificationService } from '../../core/services/notification.service';
import { Need } from '../../core/models/need.model';
import { NeedFormDialogComponent, NeedDialogData } from './need-form-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData
} from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-needs',
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
  templateUrl: './needs.component.html',
  styleUrl: './needs.component.scss'
})
export class NeedsComponent implements AfterViewInit {
  private readonly needService = inject(NeedService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['NeedId', 'NeedName', 'actions'];
  readonly dataSource = new MatTableDataSource<Need>([]);
  readonly isLoaded = signal(false);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    this.loadNeeds();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadNeeds(): void {
    this.needService.getNeeds().subscribe({
      next: (needs) => {
        this.dataSource.data = needs;
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
    const ref = this.dialog.open<NeedFormDialogComponent, NeedDialogData, Need>(
      NeedFormDialogComponent,
      { data: { mode: 'add' } }
    );

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.needService.addNeed(result.NeedName).subscribe({
        next: () => {
          this.notification.success('Need added successfully');
          this.loadNeeds();
        },
        error: (err: Error) => this.notification.error(err.message)
      });
    });
  }

  openEditDialog(need: Need): void {
    const ref = this.dialog.open<NeedFormDialogComponent, NeedDialogData, Need>(
      NeedFormDialogComponent,
      { data: { mode: 'edit', need } }
    );

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.needService.updateNeed(result).subscribe({
        next: () => {
          this.notification.success('Need updated successfully');
          this.loadNeeds();
        },
        error: (err: Error) => this.notification.error(err.message)
      });
    });
  }

  openDeleteDialog(need: Need): void {
    const data: ConfirmDialogData = {
      title: 'Delete Need',
      message: `Are you sure you want to delete "${need.NeedName}"?`
    };
    const ref = this.dialog.open(ConfirmDialogComponent, { data });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.needService.deleteNeed(need.NeedId).subscribe({
        next: () => {
          this.notification.success('Need deleted successfully');
          this.loadNeeds();
        },
        error: (err: Error) => this.notification.error(err.message)
      });
    });
  }
}
