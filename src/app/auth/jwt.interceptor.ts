import { Injectable, inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';

// Con este interceptor, agregamos el token de autenticación a todas las peticiones HTTP de la aplicación
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        // Le añadimos la palabra Bearer siguiendo el estander JWT
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req);
};