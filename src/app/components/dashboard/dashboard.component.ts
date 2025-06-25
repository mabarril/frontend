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
import { UrlsUnicasService } from '../../services/urls-unicas.service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';


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
  readonly dialog = inject(MatDialog);
  listaCasais!: any;
  eventos: any;
  loading = false;

  constructor(
    private casaisService: CasaisService,
    private eventosService: EventosService,
    private authService: AuthService,
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


  openDialogInscricaoAfilhado(enterAnimationDuration: string, exitAnimationDuration: string): void {

    const dialogRef = this.dialog.open(DialogConviteAfilhado,
      {
        data: { casais: this.listaCasais, eventos: this.eventos },
        width: '500px',
        enterAnimationDuration,
        exitAnimationDuration,
      });
  }
}

@Component({
  selector: 'dialog-inscricao-afilhado',
  templateUrl: 'dialog-inscricao-afilhado.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSpinner, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DialogConviteAfilhado {

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private urlsUnicasService: UrlsUnicasService
  ) {
    this.conviteForm = this.fb.group({
      padrinho_id: ['', Validators.required],
      evento_id: ['', Validators.required],
      url_inscricao: ['']
    });
  }


  conviteForm: FormGroup;

  readonly dialogRef = inject(MatDialogRef<DialogConviteAfilhado>);
  readonly data = inject<{ casais: Casal[], eventos: Evento[] }>(MAT_DIALOG_DATA);
  readonly listaCasais = this.data.casais;
  readonly eventos = this.data.eventos;
  urlCompleta = false;

  casalAtual: Casal | undefined;
  loading = false;
  enviandoConvite = false;

  enviarConvite(): void {
    if (this.conviteForm.valid) {

      this.urlsUnicasService.gerarConvite(this.conviteForm.value)
        .subscribe({
          next: (response: any) => {
            this.enviandoConvite = false;
            this.conviteForm.value.url_inscricao = response.data.urlCompleta;


            if (response) {
              this.urlCompleta = true;
              this.snackBar.open('URL de convite gerada com sucesso!', 'Fechar', {
                duration: 5000,
                panelClass: ['success-snackbar']
              });
            }
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

}