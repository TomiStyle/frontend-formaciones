import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-usuarios',
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
    MatDialogModule,
    NavbarComponent,
    MatSnackBarModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  user: any;
  users: any[] = [];
  displayedColumns: string[] = ['id', 'name', 'surname', 'role', 'actions'];
  showCreateUserForm = false;   // Ocultamos el formulario de alta de usuario
  showEditUserModal = false;    // Ocultamos el modal de edición de usuario
  newUser = {
    id: '',
    name: '',
    surname: '',
    password: '',
    role: 2
  };
  editUserData = {
    id: '',
    name: '',
    surname: '',
    role: 2
  };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.user = this.authService.getUser();
    this.loadUsers();
  }

  // Cargamos los usuarios de la API
  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users = response.users;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  // Guardamos la información del nuevo usuario
  createUser() {
    this.userService.createUser(this.newUser).subscribe({
      next: (response: any) => {
        this.showCreateUserForm = false;
        this.newUser = { id: '', name: '', surname: '', password: '', role: 2 };
        this.loadUsers();
        // Mostramos el mensaje con un Toast
        this.snackBar.open(response.message || 'Usuario guardado', 'Cerrar', { 
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      },
      error: (err) => {
        let msg = 'Se ha producido un error';
        if (err.error?.error) {
          msg = err.error.error;
        } else if (err.error?.message) {
          msg = err.error.message;
        }
        // Ssi hay un error lo mostramos en el Toast
        this.snackBar.open(msg, 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }
    });
  }

  // Mostramos u ocultamos el formulario de Nuevo Usuario
  toggleCreateUserForm() {
    this.showCreateUserForm = !this.showCreateUserForm;
  }

  // Ocultamos el formulario de Nuevo Usuario y ponemos los valores en vacío
  cancelCreateUser() {
    this.showCreateUserForm = false;
    this.newUser = { id: '', name: '', surname: '', password: '', role: 2 };
  }

  editUser(user: any) {
    // Mostramos el modal de Editar Usuario
    this.showEditUserModal = true;
    // Cargar datos del usuario desde la API
    this.userService.getUser(user.id).subscribe({
      next: (response: any) => {
        const u = response.user;
        this.editUserData = {
          id: u.id,
          name: u.name,
          surname: u.surname,
          role: u.role
        };
      },
      error: (err) => {
        // Si hay un error lo mostramos en el Toast
        this.snackBar.open('No se pudo cargar el usuario', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        this.showEditUserModal = false;
      }
    });
  }

  updateUser() {
    const { id, name, surname, role } = this.editUserData;
    const body = { name, surname, role };
    // Guardamos la información del usuario en BBDD a través de la API
    this.userService.updateUser(id, body).subscribe({
      next: (response: any) => {
        // Ocultamos el formulario y ponemos en vacío el formulario
        this.showEditUserModal = false;
        this.editUserData = { id: '', name: '', surname: '', role: 2 };
        // Volvemos a cargar la lista de usuarios
        this.loadUsers();
        this.snackBar.open(response.message || 'Usuario actualizado', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
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

  cancelEditUser() {
    this.showEditUserModal = false;
    this.editUserData = { id: '', name: '', surname: '', role: 2 };
  }

  deleteUser(dni: string) {
    // Mostramos un mensaje de confirmación para la eliminación del usuario
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar usuario',
        message: '¿Estás seguro de que quieres eliminar este usuario?'
      }
    });

    // Si aceptamos lo eliminamos
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(dni).subscribe({
          next: () => {
            this.loadUsers();
            this.snackBar.open('Usuario eliminado correctamente', 'Cerrar', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center'
            });
          },
          error: (err) => {
            console.error('Error al eliminar usuario:', err);
            this.snackBar.open('Error al eliminar el usuario', 'Cerrar', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center'
            });
          }
        });
      }
    });
  }

  // Decodificamos el literal del código de Tipo de Usuario
  getRoleName(role: number): string {
    return role === 1 ? 'Administrador' : 'Usuario';
  }
}