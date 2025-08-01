import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../users/user.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    NavbarComponent,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  user: any;
  profileData: any = {};
  form = {
    name: '',
    surname: '',
    oldPassword: '',
    newPassword: '',
    repeatPassword: ''
  };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.user = this.authService.getUser();
    this.loadProfile();
  }

  // Cargamos los datos del usuario logueado
  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (response: any) => {
        this.profileData = response.user;
        this.form.name = response.user.name;
        this.form.surname = response.user.surname;
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.snackBar.open('Error al cargar el perfil', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }
    });
  }

  updateProfile() {
    // El nombre y apellidos es obligatorio que estén para actualizar la información
    if (!this.form.name || !this.form.surname) {
      this.snackBar.open('Nombre y apellidos son obligatorios', 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });
      return;
    }

    // Validaciones de contraseña (solo si se quiere cambiar, en caso de no cambiarla, se dejan vacíos)
    const changingPassword = this.form.oldPassword || this.form.newPassword || this.form.repeatPassword;
    
    if (changingPassword) {
      if (!this.form.oldPassword || !this.form.newPassword || !this.form.repeatPassword) {
        this.snackBar.open('Para cambiar la contraseña, todos los campos de contraseña son obligatorios', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        return;
      }

      // Validamos que la nueva contraseña esté escrita dos veces
      if (this.form.newPassword !== this.form.repeatPassword) {
        this.snackBar.open('Las contraseñas nuevas no coinciden', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        return;
      }
    }

    // Prepararamos el body de la petición según si se cambia contraseña o no
    const body: any = {
      dni: this.profileData.id,
      name: this.form.name,
      surname: this.form.surname
    };

    // Solo añadiremos campos de contraseña si se quiere cambiar
    if (changingPassword) {
      body.oldPassword = this.form.oldPassword;
      body.newPassword = this.form.newPassword;
    }

    this.userService.updateProfile(body).subscribe({
      next: (response: any) => {
        this.snackBar.open(response.message || 'Perfil actualizado correctamente', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        
        // Actualizamos datos del usuario en memoria y en LocalStorage, ya que si no, la información visible en pantalla no estaría actualizada con la de la BBDD
        this.user.name = this.form.name;
        this.user.surname = this.form.surname;
        this.authService.setUser(this.user);
      },
      error: (err) => {
        let msg = 'Se ha producido un error';
        if (err.error?.error) {
          msg = err.error.error;
        } else if (err.error?.message) {
          msg = err.error.message;
        }
        this.snackBar.open(msg, 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }
    });
  }
}