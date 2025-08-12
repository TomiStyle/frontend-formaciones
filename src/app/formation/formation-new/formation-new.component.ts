import { CommonModule } from '@angular/common';
import { Component, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FormationService } from '../formation.service';

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatDateFormats,
  MatNativeDateModule,
  NativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  // Formato para la vista: dd/MM/yyyy
  override format(date: Date, displayFormat: any): string {
    const dd = this._to2(date.getDate());
    const mm = this._to2(date.getMonth() + 1);
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  private _to2(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }
}

export const APP_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' } as any,
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' } as any,
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' } as any,
    monthYearA11yLabel: { year: 'numeric', month: 'long' } as any,
  },
};

@Component({
  selector: 'app-formation-new',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NavbarComponent,
  ],
  templateUrl: './formation-new.component.html',
  styleUrls: ['./formation-new.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }, // Usamos Español para los formatos de fecha y datepicker
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
})
export class FormationNewComponent {
  user: any;

  form: {
    title: string;
    date: Date | null;
    num_columns: number;
  } = {
    title: '',
    date: null,
    num_columns: 0,
  };

  file: File | null = null;
  uploading = false;

  constructor(
    private authService: AuthService,
    private formationService: FormationService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.user = this.authService.getUser();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (!file) {
      this.file = null;
      return;
    }

    const allowed = ['.xlsx', '.xls'];
    const lower = file.name.toLowerCase();
    const validExt = allowed.some((ext) => lower.endsWith(ext));

    if (!validExt) {
      this.snackBar.open(
        'El archivo debe ser un Excel (.xlsx o .xls)',
        'Cerrar',
        {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        }
      );
      this.file = null;
      input.value = '';
      return;
    }

    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) {
      this.snackBar.open(`El archivo no puede superar ${maxMB} MB`, 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      this.file = null;
      input.value = '';
      return;
    }

    this.file = file;
  }

  // Transformamos la fecha para formato yyyy-MM-dd
  private formatDateForApi(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Validamos los datos del formulario
  validateForm(): boolean {
    if (!this.form.title?.trim()) {
      this.snackBar.open('El título es obligatorio', 'Cerrar', {
        duration: 2500,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      return false;
    }

    if (
      !this.form.date ||
      !(this.form.date instanceof Date) ||
      isNaN(this.form.date.getTime())
    ) {
      this.snackBar.open(
        'La fecha es obligatoria y debe ser válida',
        'Cerrar',
        {
          duration: 2500,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        }
      );
      return false;
    }

    if (
      !this.form.num_columns ||
      this.form.num_columns < 1 ||
      !Number.isInteger(Number(this.form.num_columns))
    ) {
      this.snackBar.open(
        'El número de columnas debe ser un entero positivo',
        'Cerrar',
        {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        }
      );
      return false;
    }

    if (!this.file) {
      this.snackBar.open('Debes seleccionar un archivo Excel', 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      return false;
    }

    return true;
  }

  submit() {
    if (!this.validateForm() || !this.file || !this.form.date) return;

    const formData = new FormData();
    formData.append('title', this.form.title.trim());
    formData.append('date', this.formatDateForApi(this.form.date)); // Transformamos el formato de la fecha
    formData.append('num_columns', String(this.form.num_columns));
    formData.append('file', this.file);

    this.uploading = true;

    this.formationService.createFormation(formData).subscribe({
      next: (res: any) => {
        this.uploading = false;
        this.snackBar.open(
          res?.message || 'Formación creada correctamente',
          'Cerrar',
          {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          }
        );
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.uploading = false;
        let msg = 'Se ha producido un error al crear la formación';
        if (err?.error?.error) msg = err.error.error;
        else if (err?.error?.message) msg = err.error.message;
        this.snackBar.open(msg, 'Cerrar', {
          duration: 4000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      },
    });
  }
}
