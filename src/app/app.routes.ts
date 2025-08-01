import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './auth/auth.guard';
import { UsersComponent } from './users/users.component';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    // Aplicamos la protección para que un usuario esté logueado, si no, devolverá a la página de login
    { path: '', canActivate: [authGuard], loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
    { path: 'users', canActivate: [authGuard], component: UsersComponent },
    { path: 'profile', canActivate: [authGuard], component: ProfileComponent },
];