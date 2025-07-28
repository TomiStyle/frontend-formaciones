import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './auth/auth.guard';
import { UsuariosComponent } from './usuarios/usuarios.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', canActivate: [authGuard], loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
    { path: 'usuarios', canActivate: [authGuard], component: UsuariosComponent },
    // Otras rutas protegidas
];