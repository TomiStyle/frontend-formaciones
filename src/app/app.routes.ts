import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { FormationNewComponent } from './formation/formation-new/formation-new.component';
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
];
