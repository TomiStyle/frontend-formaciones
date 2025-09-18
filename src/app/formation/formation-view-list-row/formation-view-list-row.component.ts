import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { LoadingOverlayComponent } from '../../shared/loading-overlay/loading-overlay.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import {
  PersonDetail,
  PersonDetailModalComponent,
} from '../../shared/person-detail-modal/person-detail-modal.component';
import { FormationService } from '../formation.service';

interface Person {
  _id: string;
  person_id: number;
  scale: number;
  row: number;
  column: number;
  name: string;
  surname: string;
  old_row?: number | null;
  old_column?: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Formation {
  id: string;
  title: string;
  date: string;
  num_columns: number;
}

interface RowData {
  rowNumber: number;
  people: Person[];
}

@Component({
  selector: 'app-formation-view-list-row',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    NavbarComponent,
    LoadingOverlayComponent,
    PersonDetailModalComponent,
  ],
  templateUrl: './formation-view-list-row.component.html',
  styleUrls: ['./formation-view-list-row.component.scss'],
})
export class FormationViewListRowComponent implements OnInit {
  user: any;
  loading = true;
  formation: Formation | null = null;
  rows: RowData[] = [];
  formationId: string | null = null;
  selectedRow: string = 'all';

  // Modal de persona
  isPersonModalOpen = false;
  selectedPerson: PersonDetail | null = null;

  constructor(
    private authService: AuthService,
    private formationService: FormationService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.user = this.authService.getUser();
  }

  // Cargamos la información de la formación
  ngOnInit() {
    this.formationId = this.route.snapshot.paramMap.get('id');
    if (!this.formationId) {
      this.showError('ID de formación no válido');
      this.router.navigate(['/']);
      return;
    }
    this.loadFormationData();
  }

  loadFormationData() {
    if (!this.formationId) return;

    // Activamos el overlay de carga
    this.loading = true;
    // Cargamos la información con la API (usando el endpoint de filas)
    this.formationService
      .getFormationWithPeopleByRow(this.formationId)
      .subscribe({
        next: (data: { formation: Formation; people: Person[] }) => {
          this.formation = data.formation;
          this.organizeDataByRows(data.people);
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          let msg = 'Error al cargar la formación';
          if (err?.error?.error) msg = err.error.error;
          else if (err?.error?.message) msg = err.error.message;
          this.showError(msg);
        },
      });
  }

  // Agrupamos las personas por filas
  private organizeDataByRows(people: Person[]) {
    if (!this.formation) return;
    const rowMap = new Map<number, Person[]>();

    // Inicializamos el mapa con todas las filas posibles
    const maxRow =
      people.length > 0 ? Math.max(...people.map((p) => p.row)) : 0;
    for (let i = 1; i <= maxRow; i++) {
      rowMap.set(i, []);
    }

    // Agrupamos las personas por fila
    people.forEach((person) => {
      const rowPeople = rowMap.get(person.row) || [];
      rowPeople.push(person);
      rowMap.set(person.row, rowPeople);
    });

    // Convertimos el mapa a array y ordenamos
    this.rows = Array.from(rowMap.entries())
      .map(([rowNumber, people]) => ({
        rowNumber,
        people: people.sort((a, b) => a.column - b.column), // Ordenamos por columna dentro de cada fila
      }))
      .filter((row) => row.people.length > 0) // Solo mostramos filas que tienen personas
      .sort((a, b) => a.rowNumber - b.rowNumber); // Ordenamos las filas
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  trackByPersonId(index: number, person: Person) {
    return person._id;
  }

  getTotalPeople(): number {
    return this.rows.reduce((acc, row) => acc + row.people.length, 0);
  }

  getRowsToShow(): RowData[] {
    if (this.selectedRow === 'all') {
      return this.rows;
    }
    const rowNum = Number(this.selectedRow);
    return this.rows.filter((row) => row.rowNumber === rowNum);
  }

  // Propiedades calculadas para el modal
  get maxRows(): number {
    if (!this.rows || this.rows.length === 0) return 0;
    const allPeople = this.rows.flatMap((r) => r.people);
    if (allPeople.length === 0) return 0;
    return Math.max(...allPeople.map((p) => p.row));
  }

  get allPeople(): PersonDetail[] {
    return this.rows.flatMap((r) => r.people);
  }

  // Métodos del modal
  openPersonModal(person: Person) {
    this.selectedPerson = {
      _id: person._id,
      person_id: person.person_id,
      scale: person.scale,
      row: person.row,
      column: person.column,
      name: person.name,
      surname: person.surname,
      old_row: person.old_row ?? null,
      old_column: person.old_column ?? null,
    };
    this.isPersonModalOpen = true;
  }

  closePersonModal() {
    this.isPersonModalOpen = false;
    this.selectedPerson = null;
  }

  handleConfirmSwap(event: {
    fromPerson: PersonDetail;
    targetPerson: PersonDetail;
  }) {
    if (!this.formationId) return;

    const swapData = {
      person1_id: event.fromPerson._id,
      person2_id: event.targetPerson._id,
    };

    // Llamamos a la API para actualizar en BBDD las posiciones de las dos personas
    this.formationService.swapPositions(this.formationId, swapData).subscribe({
      next: () => {
        this.closePersonModal();
        this.loadFormationData(); // Refrescamos la formación desde la API
        this.showSuccess('Posiciones intercambiadas correctamente');
      },
      error: (err) => {
        console.error('Error al intercambiar personas:', err);
        this.showError('Error al intercambiar posiciones');
      },
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }

  // Escuchamos el evento de Sacar de la formación y llamamos al servicio
  handleRemovePerson(personId: string) {
    if (!this.formationId) return;

    // Activamos el overlay de carga puesto que es un proceso algo más largo
    this.loading = true;

    this.formationService.removePerson(this.formationId, personId).subscribe({
      next: () => {
        this.closePersonModal();
        this.loadFormationData();
        this.showSuccess('Persona sacada de la formación');
      },
      error: (err) => {
        // Ocultamos el overlay de carga
        this.loading = false;
        console.error('Error al sacar persona:', err);
        this.showError('Error al sacar persona de la formación');
      },
    });
  }

  handleAddPerson(personId: string) {
    if (!this.formationId) return;

    this.loading = true;

    this.formationService.reinsertPerson(this.formationId, personId).subscribe({
      next: () => {
        this.closePersonModal();
        this.loadFormationData();
        this.showSuccess('Persona reinsertada en la formación correctamente');
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al reinsertar persona:', err);
        this.showError('Error al reinsertar persona en la formación');
      },
    });
  }
}
