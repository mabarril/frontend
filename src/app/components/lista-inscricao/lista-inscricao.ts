import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UrlsUnicasService } from '../../services/urls-unicas.service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatLabel } from '@angular/material/form-field';

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
  selector: 'app-lista-inscricao',
  imports: [
    MatCardModule, MatLabel, MatFormFieldModule, MatSelectModule,CommonModule, MatButtonModule
  ],
  templateUrl: './lista-inscricao.html',
  styleUrl: './lista-inscricao.scss'
})

export class ListaInscricao implements OnInit {
  readonly dialog = inject(MatDialog);
  listaCasais!: any;
  eventos: any;
  loading = false;


  constructor(
    private casaisService: CasaisService,
    private eventosService: EventosService,

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




  openDialogInscricaoAfilhado(enterAnimationDuration: string, exitAnimationDuration: string): void {

    const dialogRef = this.dialog.open(DialogConviteAfilhado,
      {
        data: { casais: this.listaCasais, eventos: this.eventos },
        width: '500px',
        enterAnimationDuration,
        exitAnimationDuration,
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

}

@Component({
  selector: 'dialog-inscricao-afilhado',
  templateUrl: 'dialog-inscricao-afilhado.html',
  styleUrls: ['./lista-inscricao.scss'],
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSpinner, ReactiveFormsModule],
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
  urlCompleta = '';
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
            this.urlCompleta = response.data.urlCompleta;

            if (response && response.data && response.data[0]) {
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
