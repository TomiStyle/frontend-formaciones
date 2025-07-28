import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './auth/auth.guard';
// Importa aquí tus otros componentes

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', canActivate: [authGuard], loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
    // Otras rutas protegidas
];