import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, NavbarComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent {
  user: any;
  users: any[] = [];
  displayedColumns: string[] = ['id', 'name', 'surname', 'role', 'actions'];

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {
    this.user = this.authService.getUser();
    this.loadUsers();
  }

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

  deleteUser(dni: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.userService.deleteUser(dni).subscribe({
        next: () => this.loadUsers(),
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
        }
      });
    }
  }

  editUser(user: any) {
    // Aquí irá la lógica para editar usuario
    console.log('Editar usuario:', user);
  }

  getRoleName(role: number): string {
    return role === 1 ? 'Administrador' : 'Usuario';
  }
}