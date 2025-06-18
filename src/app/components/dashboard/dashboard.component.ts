import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

// Angular Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { CasaisService } from '../../services/casais.service';
import { EventosService } from '../../services/eventos.service';
import { UrlsUnicasService } from '../../services/urls-unicas.service';

interface Casal {
  id: number;
  nome_esposo: string;
  nome_esposa: string;
  email_contato: string;
}

interface Evento {
  id: number;
  nome: string;
  data_inicio: string;
  data_fim: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  conviteForm: FormGroup;
  casais!: any;
  listaCasais!: any;
  casalAtual: Casal | undefined;
  eventos: any;
  loading = false;
  enviandoConvite = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private casaisService: CasaisService,
    private eventosService: EventosService,
    private urlsUnicasService: UrlsUnicasService
  ) {
    this.conviteForm = this.fb.group({
      casal_id: ['', Validators.required],
      evento_id: ['', Validators.required],
      email_destino: ['', [Validators.required, Validators.email]],
      mensagem_personalizada: ['']
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.loading = true;

    // Carregar casais
    this.casaisService.getCasais().subscribe({
      next: (response) => {
        this.carregaListaCasais(response);
        console.log(response);

      },
      error: (error) => {
        console.error('Erro ao carregar casais:', error);
        this.snackBar.open('Erro ao carregar casais', 'Fechar', { duration: 3000 });
      }

    });

    // Carregar eventos
    this.eventosService.getEventos().subscribe({
      next: (response) => {
        this.eventos = response || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar eventos:', error);
        this.snackBar.open('Erro ao carregar eventos', 'Fechar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  enviarConvite(): void {
    if (this.conviteForm.valid) {
      this.enviandoConvite = true;

      this.urlsUnicasService.gerarConvite(this.conviteForm.value)
        .subscribe({
          next: (response) => {
            this.enviandoConvite = false;
            if (response) {
              this.snackBar.open('Convite enviado com sucesso!', 'Fechar', {
                duration: 5000,
                panelClass: ['success-snackbar']
              });
              this.conviteForm.reset();
            } 
            // else {
            //   this.snackBar.open(response.message || 'Erro ao enviar convite', 'Fechar', { duration: 3000 });
            // }
          },
          error: (error) => {
            this.enviandoConvite = false;
            console.error('Erro ao enviar convite:', error);
            this.snackBar.open(
              error.error?.message || 'Erro ao enviar convite',
              'Fechar',
              { duration: 3000 }
            );
          }
        });
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Mesmo com erro, fazer logout local
        this.router.navigate(['/login']);
      }
    });
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  carregaListaCasais(casais: any): void {
    this.listaCasais = [];
    casais.forEach((casal: any) => {
      let casalAtual: Casal = {
        id: casal.id,
        nome_esposo: '',
        nome_esposa: '',
        email_contato: ''
      };
      casal.pessoas.forEach((pessoa: any) => {
        if (pessoa.tipo === 'esposo') {
          casalAtual.nome_esposo = pessoa.nome_social;
        } else if (pessoa.tipo === 'esposa') {
          casalAtual.nome_esposa = pessoa.nome_social;
        }
      });
      this.listaCasais.push(casalAtual);
    });
    console.log('lista', this.listaCasais)
  }
}