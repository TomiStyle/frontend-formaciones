import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

export interface PersonDetail {
  _id: string;
  person_id: number;
  scale: number;
  row: number;
  column: number;
  name: string;
  surname: string;
  old_row?: number | null;
  old_column?: number | null;
}

@Component({
  selector: 'app-person-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
  ],
  templateUrl: './person-detail-modal.component.html',
  styleUrls: ['./person-detail-modal.component.scss'],
})
export class PersonDetailModalComponent {
  @Input() isOpen = false;
  @Input() person: PersonDetail | null = null;
  @Input() numRows: number = 0;
  @Input() numColumns: number = 0;
  @Input() allPeople: PersonDetail[] = [];

  @Output() closeModal = new EventEmitter<void>();
  @Output() confirmSwap = new EventEmitter<{
    fromPerson: PersonDetail;
    targetPerson: PersonDetail;
  }>();
  @Output() removePerson = new EventEmitter<string>();
  @Output() addPerson = new EventEmitter<string>();

  changeMode = false; // Para controlar si se muestra el formulario de cambio de posición
  selectedRow: number | null = null;
  selectedColumn: number | null = null;

  // Cerramos el modal de cambio de posición
  onClose() {
    this.closeModal.emit();
    this.resetChangeMode();
  }

  // Activamos el modal de cambio de posición
  onChangePosition() {
    this.changeMode = true;
    this.selectedRow = null;
    this.selectedColumn = null;
  }

  // Ocultamos el formulario de cambio de posición y dejamos los datos de la persona
  onCancelChange() {
    this.resetChangeMode();
  }

  // Ocultamos el formulario de cambio de posición
  private resetChangeMode() {
    this.changeMode = false;
    this.selectedRow = null;
    this.selectedColumn = null;
  }

  // Cogemos los datos, de memoria, de la persona dependiendo de la fila y columna
  get targetPerson(): PersonDetail | null {
    if (this.selectedRow && this.selectedColumn) {
      return (
        this.allPeople.find(
          (p) => p.row === this.selectedRow && p.column === this.selectedColumn
        ) || null
      );
    }
    return null;
  }

  get rowOptions(): number[] {
    return Array.from({ length: this.numRows }, (_, i) => i + 1);
  }

  get columnOptions(): number[] {
    return Array.from({ length: this.numColumns }, (_, i) => i + 1);
  }

  // Para habilitar o no el botón de confirmación de cambio de posición
  get canConfirmSwap(): boolean {
    return !!(
      this.selectedRow &&
      this.selectedColumn &&
      this.targetPerson &&
      this.person &&
      this.targetPerson._id !== this.person._id
    );
  }

  onConfirmSwap() {
    if (this.person && this.targetPerson && this.canConfirmSwap) {
      this.confirmSwap.emit({
        fromPerson: this.person,
        targetPerson: this.targetPerson,
      });
      this.resetChangeMode();
    }
  }

  // Para sacar a una persona de la formación
  onRemovePerson() {
    if (this.person && this.person._id) {
      this.removePerson.emit(this.person._id);
    }
  }

  // Para reinsertar a una persona en la formación
  onAddPerson() {
    if (this.person && this.person._id) {
      this.addPerson.emit(this.person._id);
    }
  }
}
