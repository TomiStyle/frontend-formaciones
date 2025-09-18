import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { FormationNewComponent } from './formation/formation-new/formation-new.component';
import { FormationViewListRowComponent } from './formation/formation-view-list-row/formation-view-list-row.component';
import { FormationViewListComponent } from './formation/formation-view-list/formation-view-list.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { UsersComponent } from './users/users.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  // Aplicamos la protección para que un usuario esté logueado, si no, devolverá a la página de login
  { path: '', canActivate: [authGuard], component: HomeComponent },
  { path: 'users', canActivate: [authGuard], component: UsersComponent },
  { path: 'profile', canActivate: [authGuard], component: ProfileComponent },
  {
    path: 'formations/new',
    canActivate: [authGuard],
    component: FormationNewComponent,
  },
  // {
  //   path: 'formations/:id/formationGrid',
  //   canActivate: [authGuard],
  //   component: FormationViewGridComponent,
  // },
  {
    path: 'formations/:id/formationList',
    canActivate: [authGuard],
    component: FormationViewListComponent,
  },
  {
    path: 'formations/:id/formationListRow',
    canActivate: [authGuard],
    component: FormationViewListRowComponent,
  },
];
