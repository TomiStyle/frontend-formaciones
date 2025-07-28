import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Input() user: any;
  menuOpen = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  goHome() {
    this.router.navigate(['/']);
    this.menuOpen = false;
  }

  nuevaFormacion() {
    this.router.navigate(['/formaciones/nueva']);
    this.menuOpen = false;
  }

  editarPerfil() {
    this.router.navigate(['/perfil']);
    this.menuOpen = false;
  }

  gestionUsuarios() {
    this.router.navigate(['/usuarios']);
    this.menuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.menuOpen = false;
  }
}