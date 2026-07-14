import { Component, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import { ToolbarComponent } from './shared/components/toolbar/toolbar.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
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
  @ViewChild('sidenav') sidenav!: MatSidenav;

  readonly navLinks = [
    { path: '/family-needs', label: 'Family Needs', icon: 'checklist' },
    { path: '/families', label: 'Families Lookup', icon: 'diversity_3' },
    { path: '/needs', label: 'Needs Lookup', icon: 'volunteer_activism' }
  ];

  toggleSidenav(): void {
    this.sidenav.toggle();
  }
}
