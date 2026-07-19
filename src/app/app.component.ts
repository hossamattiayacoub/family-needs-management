import { Component, ViewChild, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { ToolbarComponent } from './shared/components/toolbar/toolbar.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    ToolbarComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  readonly navLinks = [
    { path: '/family-needs', label: 'Family Needs', icon: 'checklist' },
    { path: '/families', label: 'Families Lookup', icon: 'diversity_3' },
    { path: '/needs', label: 'Needs Lookup', icon: 'volunteer_activism' }
  ];

  /** True on phones/small screens — drives sidenav mode + default open state. */
  readonly isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  /** Synchronous signal version, since pipes aren't allowed in event bindings. */
  private readonly isHandset = toSignal(this.isHandset$, { initialValue: false });

  toggleSidenav(): void {
    this.sidenav.toggle();
  }

  /** Auto-close the sidenav after tapping a nav link, but only on mobile (overlay mode). */
  closeIfHandset(): void {
    if (this.isHandset()) {
      this.sidenav.close();
    }
  }
}
