import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

// CARGAMOS LAS RUTAS CON LAZY LOADING PARA QUE EL main.js SEA MÁS LIVIANO

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  // Aplicamos la protección para que un usuario esté logueado, si no, devolverá a la página de login
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./users/users.component').then((m) => m.UsersComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'formations/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./formation/formation-new/formation-new.component').then(
        (m) => m.FormationNewComponent
      ),
  },
  // {
  //   path: 'formations/:id/formationGrid',
  //   canActivate: [authGuard],
  //   component: FormationViewGridComponent,
  // },
  {
    path: 'formations/:id/formationList',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './formation/formation-view-list/formation-view-list.component'
      ).then((m) => m.FormationViewListComponent),
  },
  {
    path: 'formations/:id/formationListRow',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './formation/formation-view-list-row/formation-view-list-row.component'
      ).then((m) => m.FormationViewListRowComponent),
  },
];
