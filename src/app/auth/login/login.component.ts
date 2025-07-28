import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, 
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      dni: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { dni, password } = this.loginForm.value;
      this.authService.login(dni, password).subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => {
          this.error = err.error?.error || 'Error al hacer Login';
        }
      });
    }
  }
}