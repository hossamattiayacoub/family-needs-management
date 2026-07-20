import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'family-needs'
  },
  {
    path: 'family-needs',
    loadComponent: () =>
      import('./pages/family-needs/family-needs.component').then((m) => m.FamilyNeedsComponent),
    title: 'Family Needs'
  },
  {
    path: 'families',
    loadComponent: () =>
      import('./pages/families/families.component').then((m) => m.FamiliesComponent),
    title: 'Families Lookup'
  },
  {
    path: 'needs',
    loadComponent: () =>
      import('./pages/needs/needs.component').then((m) => m.NeedsComponent),
    title: 'Needs Lookup'
  },
  {
    path: 'groups',
    loadComponent: () =>
      import('./pages/groups/groups.component').then((m) => m.GroupsComponent),
    title: 'Groups Lookup'
  },
  {
    path: 'need-categories',
    loadComponent: () =>
      import('./pages/need-category/need-category.component').then((m) => m.NeedCategoryComponent),
    title: 'Need Category'
  },
  {
    path: '**',
    redirectTo: 'family-needs'
  }
];
