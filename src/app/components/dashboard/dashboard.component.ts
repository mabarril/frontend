import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Data, Router } from '@angular/router';

// Angular Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule, MatSpinner } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { CasaisService } from '../../services/casais.service';
import { EventosService } from '../../services/eventos.service';

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
    MatMenuModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  listaCasais!: any;
  eventos: any;
  loading = false;

  constructor(
    private casaisService: CasaisService,
    private eventosService: EventosService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }


  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.loading = true;

    // Carregar casais
    this.casaisService.getCasais().subscribe({
      next: (response) => {
        this.carregaListaCasais(response);

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

  openListaInscricao() {
    this.router.navigate(['/lista-incricao']);
  }

  openCadastraCasal() {
    this.router.navigate(['/registro']);
  }
}