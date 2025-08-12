import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @Input() user: any;
  menuOpen = false;

  constructor(private router: Router, private authService: AuthService) {}

  goHome() {
    this.router.navigate(['/']);
    this.menuOpen = false;
  }

  nuevaFormacion() {
    this.router.navigate(['/formations/new']);
    this.menuOpen = false;
  }

  editarPerfil() {
    this.router.navigate(['/profile']);
    this.menuOpen = false;
  }

  gestionUsuarios() {
    this.router.navigate(['/users']);
    this.menuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.menuOpen = false;
  }
}
