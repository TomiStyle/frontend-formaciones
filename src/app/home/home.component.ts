import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../auth/auth.service';
import { FormationService } from '../formation/formation.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { LoadingOverlayComponent } from '../shared/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    NavbarComponent,
    LoadingOverlayComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  user: any;
  formations: any[] = [];
  loading = false;
  errorMsg = '';
  // Controla qué IDs están en proceso de borrado para deshabilitar su botón y evitar dobles clic
  deletingIds = new Set<string>();

  constructor(
    private authService: AuthService,
    private formationService: FormationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {
    this.fetchFormations();
  }

  // Cargamos las formaciones
  fetchFormations(): void {
    this.loading = true;
    this.errorMsg = '';
    this.formationService.listFormations().subscribe({
      next: (res: any) => {
        this.loading = false;
        const arr = Array.isArray(res?.formations) ? res.formations : [];
        this.formations = arr;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Error al cargar formaciones';
        this.snackBar.open(this.errorMsg, 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      },
    });
  }

  // Navegamos a la ruta de Nueva Formación
  goToNew(): void {
    this.router.navigate(['/formations/new']);
  }

  // // Navegamos a la vista de grid de la formación
  // goToFormationGrid(f: any, event?: Event): void {
  //   event?.stopPropagation();
  //   if (!f?.id) return;
  //   this.router.navigate(['/formations', f.id, 'formationGrid']);
  // }

  // Navegamos a la vista de formación en formato listado por columnas
  goToFormationListColumn(f: any, event?: Event): void {
    event?.stopPropagation();
    if (!f?.id) return;
    this.router.navigate(['/formations', f.id, 'formationList']);
  }

  // Eliminamos una formación usando MatDialog
  onDeleteFormation(f: any, event?: Event): void {
    // Evitamos que el click de la papelera burbujee
    event?.stopPropagation();
    if (!f?.id) return;

    // Quitamos foco del botón para evitar que se quede el estilo de focus/hover
    const btnEl = event?.currentTarget as HTMLElement | undefined;
    btnEl?.blur();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: f.title,
        message: '¿Estás seguro de que quieres eliminar esta formación?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      // Aseguramos quitar foco residual al cerrar el diálogo
      setTimeout(() => {
        (document.activeElement as HTMLElement)?.blur?.();
      }, 0);

      if (!confirmed) return;

      this.deletingIds.add(f.id);
      this.formationService.deleteFormation(f.id).subscribe({
        next: () => {
          this.deletingIds.delete(f.id);
          this.formations = this.formations.filter((x) => x.id !== f.id);
          this.snackBar.open('Formación eliminada correctamente', 'Cerrar', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
        },
        error: (err) => {
          this.deletingIds.delete(f.id);
          this.errorMsg =
            err?.error?.message || 'No se pudo eliminar la formación';
          this.snackBar.open(this.errorMsg, 'Cerrar', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
        },
      });
    });
  }

  // Método para formatear la fecha
  formatDate(isoStr: string): string {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
}