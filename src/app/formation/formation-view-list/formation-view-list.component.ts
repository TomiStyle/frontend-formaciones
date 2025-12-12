import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
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

interface ColumnData {
  columnNumber: number;
  people: Person[];
}

@Component({
  selector: 'app-formation-view-list',
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
  templateUrl: './formation-view-list.component.html',
  styleUrls: ['./formation-view-list.component.scss'],
})
export class FormationViewListComponent implements OnInit {
  user: any;
  loading = true;
  formation: Formation | null = null;
  columns: ColumnData[] = [];
  formationId: string | null = null;
  selectedColumn: string = 'all';

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
    // Cargamos la información con la API
    this.formationService
      .getFormationWithPeopleByColumn(this.formationId)
      .subscribe({
        next: (data: { formation: Formation; people: Person[] }) => {
          this.formation = data.formation;
          this.organizeDataByColumns(data.people);
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

  // Agrupamos las personas por columnas
  private organizeDataByColumns(people: Person[]) {
    if (!this.formation) return;
    const columnMap = new Map<number, Person[]>();
    for (let i = 1; i <= this.formation.num_columns; i++) {
      columnMap.set(i, []);
    }
    people.forEach((person) => {
      const columnPeople = columnMap.get(person.column) || [];
      columnPeople.push(person);
      columnMap.set(person.column, columnPeople);
    });
    this.columns = Array.from(columnMap.entries())
      .map(([columnNumber, people]) => ({
        columnNumber,
        people: people.sort((a, b) => a.row - b.row),
      }))
      .sort((a, b) => a.columnNumber - b.columnNumber);
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
    return this.columns.reduce((acc, col) => acc + col.people.length, 0);
  }

  getColumnsToShow(): ColumnData[] {
    if (this.selectedColumn === 'all') {
      return this.columns;
    }
    const colNum = Number(this.selectedColumn);
    return this.columns.filter((col) => col.columnNumber === colNum);
  }

  // Propiedades calculadas para el modal
  get maxRows(): number {
    if (!this.columns || this.columns.length === 0) return 0;
    const allPeople = this.columns.flatMap((c) => c.people);
    if (allPeople.length === 0) return 0;
    return Math.max(...allPeople.map((p) => p.row));
  }

  get allPeople(): PersonDetail[] {
    return this.columns.flatMap((c) => c.people);
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

  downloadPdfByColumns() {
    if (!this.columns || this.columns.length === 0 || !this.formation) {
      return;
    }

    this.loading = true;

    setTimeout(() => {
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Para que la posible columna 0 sea la última en mostrarse
        const sortedColumns = [...this.columns].sort((a, b) => {
          if (a.columnNumber === 0) return 1;
          if (b.columnNumber === 0) return -1;
          return a.columnNumber - b.columnNumber;
        });

        sortedColumns.forEach((columnData, index) => {
          if (index > 0) {
            doc.addPage();
          }

          const people = columnData.people || [];

          // Cabecera de página: título de formación y columna
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          //Uso el operador de aserción no nula porque, aunque se comprueba más arriba, TypeScript me daba error porque el título de la formación podría venir nulo
          doc.text(this.formation!.title || 'Formación', pageWidth / 2, 15, {
            align: 'center',
          });

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          const subtitle = `Columna ${columnData.columnNumber} - ${people.length} personas`;
          doc.text(subtitle, pageWidth / 2, 22, { align: 'center' });

          // Calculamos tamaño de fuente según número de personas
          const maxUsableHeight = pageHeight - 30; // margen superior 30mm
          const rowsCount = people.length > 0 ? people.length : 1;
          const approxRowHeight = maxUsableHeight / rowsCount;

          // Limitar el tamaño de fuente entre 7 y 18 pt, según espacio
          let fontSize = Math.min(18, Math.max(7, approxRowHeight * 0.4));

          // Preparamos datos para autotable: solo nombre y apellidos
          const body: RowInput[] = people.map((p) => [
            `${p.name || ''} ${p.surname || ''}`.trim(),
          ]);

          autoTable(doc, {
            head: [['Nombre y apellidos']],
            body,
            startY: 30,
            styles: {
              fontSize,
              cellPadding: 1.5,
              valign: 'middle',
            },
            headStyles: {
              fillColor: [230, 230, 230],
              textColor: 0,
              fontStyle: 'bold',
              halign: 'center',
            },
            bodyStyles: {
              halign: 'left',
            },
            margin: { left: 15, right: 15 },
          });
        });

        doc.save(`${this.formation!.title || 'formacion'}_columnas.pdf`);
      } finally {
        this.loading = false;
      }
    }, 0);
  }

  async downloadExcelByColumns() {
    if (!this.columns || this.columns.length === 0 || !this.formation) return;

    this.loading = true;

    setTimeout(async () => {
      try {
        // Import dinámico para agrandar el bundle
        const ExcelJS = (await import('exceljs')).default;

        const wb = new ExcelJS.Workbook();
        wb.creator = 'Gestión de Formaciones';

        // Columna 0 al final
        const sortedColumns = [...this.columns].sort((a, b) => {
          if (a.columnNumber === 0) return 1;
          if (b.columnNumber === 0) return -1;
          return a.columnNumber - b.columnNumber;
        });

        for (const col of sortedColumns) {
          const title = `Columna ${col.columnNumber}`;
          const sheetName = this.safeSheetName(title);
          const ws = wb.addWorksheet(sheetName);

          // Anchos de las columna
          ws.getColumn(1).width = 32; // A (nombre)
          ws.getColumn(2).width = 53; // B (apellidos)

          // Fila 1: título de la hoja
          ws.getCell('A1').value = title;
          ws.mergeCells('A1:B1');

          const titleCell = ws.getCell('A1');
          titleCell.font = { bold: true, size: 24 }; // Formato de las celdas de título
          titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
          ws.getRow(1).height = 35; // Cambiamos la altura para que se vea bien el tamaño 24

          // Datos desde fila 2: A = nombre, B = apellidos
          let rowIndex = 2;
          for (const p of col.people || []) {
            const row = ws.getRow(rowIndex);
            row.getCell(1).value = p.name ?? '';
            row.getCell(2).value = p.surname ?? '';

            // Tamaño 16 para datos
            row.getCell(1).font = { size: 16 };
            row.getCell(2).font = { size: 16 };

            rowIndex++;
          }
        }

        // Generamos buffer
        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const fileName = `${this.safeFileName(
          this.formation!.title || 'formacion'
        )}_columnas.xlsx`;

        // Descargamos
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error al generar Excel:', error);
        this.showError('Error al generar el archivo Excel');
      } finally {
        this.loading = false;
      }
    }, 0);
  }

  // Limpiamos caracteres no válidos en nombres de hoja de Excel
  private safeSheetName(name: string): string {
    return (
      name
        .replace(/[:\\/?*\[\]]/g, ' ')
        .trim()
        .slice(0, 31) || 'Hoja'
    );
  }

  //Limpiamos de posibles caracteres problemáticos en nombres de archivo
  private safeFileName(name: string): string {
    return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim() || 'formacion';
  }
}
