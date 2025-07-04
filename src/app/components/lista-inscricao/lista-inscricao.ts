import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UrlsUnicasService } from '../../services/urls-unicas.service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatLabel } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { CasaisService } from '../../services/casais.service';
import { EventosService } from '../../services/eventos.service';
import { InscricoesService } from '../../services/inscricoes.service';
import { MatCheckboxModule } from '@angular/material/checkbox';


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

interface Inscricao {
  id: number;
  casal_id: number;
  evento_id: number;
  status: string;
  data_inscricao: string;
  tipo_participante: string;
}

@Component({
  selector: 'app-lista-inscricao',
  imports: [
    MatCardModule,
    MatLabel,
    MatFormFieldModule,
    MatSelectModule,
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatSpinner,
  ],
  templateUrl: './lista-inscricao.html',
  styleUrl: './lista-inscricao.scss'
})

export class ListaInscricao implements OnInit {
  urlCompleta: any;

  openDialogInscricao(arg0: any) {
    throw new Error('Method not implemented.');
  }
  readonly dialog = inject(MatDialog);
  listaCasais!: any;
  eventos: any;
  loading = false;
  eventoSelecionado: number | null = null;
  inscricoes: Inscricao[] = [];
  listaInscritos: any[] = [];
  listaInscritosOriginal: any[] = []; // Adicione esta linha
  displayedColumns: string[] = ['id', 'nome', 'tipo_participante', 'status', 'actions'];


  constructor(
    private casaisService: CasaisService,
    private eventosService: EventosService,
    private inscricoesService: InscricoesService,
    private urlsUnicasService: UrlsUnicasService,

    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.carregarDados();
  }

  onEventoChange() {
    this.listaInscritos = [];
    if (!this.eventoSelecionado) {
      return;
    }
    this.inscricoesService.getInscricoesDoEvento(this.eventoSelecionado).subscribe({
      next: (response) => {
        this.inscricoes = (response as Inscricao[]) || [];
        this.listaInscritos = [];
        this.inscricoes.forEach((inscricao: Inscricao) => {
          const casal = this.listaCasais.find((c: Casal) => c.id === inscricao.casal_id);
          const registro: any = {};
          registro['id'] = inscricao.id;
          registro['casal_id'] = inscricao.casal_id;
          registro['evento_id'] = inscricao.evento_id;
          registro['status'] = inscricao.status;
          registro['data_inscricao'] = inscricao.data_inscricao;
          registro['status'] = inscricao.status === 'confirmada' ? 'Confirmada' : 'Pendente';
          registro['tipo_participante'] = inscricao.tipo_participante;
          if (casal) {
            registro['nome'] = `${casal.nome_esposo} e ${casal.nome_esposa}`;
            registro['email'] = casal.email_contato;
          } else {
            registro['nome'] = 'Casal não encontrado';
            registro['email'] = 'Email não disponível';
          }
          this.listaInscritos.push(registro);
        });
        this.listaInscritosOriginal = [...this.listaInscritos]; // Salva a lista original para filtro
        console.log('Lista de inscritos:', this.listaInscritos);
      },
      error: (error) => {
        console.error('Erro ao carregar inscrições:', error);
        this.snackBar.open('Erro ao carregar inscrições', 'Fechar', { duration: 3000 });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.listaInscritos = this.listaInscritosOriginal.filter(casal =>
      casal.nome.toLowerCase().includes(filterValue)
    );
  }

  deleteInscricao(inscricaoId: number) {
    const dialogRef = this.dialog.open(DialogConfirmarExclusao);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Chame o serviço para deletar a inscrição
        this.inscricoesService.deletarInscricao(inscricaoId).subscribe({
          next: () => {
            this.snackBar.open('Inscrição excluída com sucesso!', 'Fechar', { duration: 3000 });
            this.onEventoChange(); // Atualiza a lista
          },
          error: () => {
            this.snackBar.open('Erro ao excluir inscrição', 'Fechar', { duration: 3000 });
          }
        });
      }
    });
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
        data: { casais: this.listaCasais, eventos: this.eventoSelecionado },
        width: '500px',
        enterAnimationDuration,
        exitAnimationDuration,
      });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.onEventoChange();
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

  copiarUrl(inscricao: any) {
    this.urlsUnicasService.urlCompleta(inscricao.id).subscribe({
      next: (response: any) => {
        this.urlCompleta = response.urlCompleta;
        this.copiarParaClipboard(this.urlCompleta);
      },
      error: (error) => {
        console.error('Erro ao obter URL completa:', error);
        this.snackBar.open('Erro ao obter URL completa', 'Fechar', { duration: 3000 });
      }
    });

    // Monte a URL completa conforme sua lógica

  }

  copiarParaClipboard(texto: string) {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(texto).then(() => {
        this.snackBar.open('URL copiada para a área de transferência!', 'Fechar', { duration: 3000 });
      }, () => {
        this.snackBar.open('Falha ao copiar URL', 'Fechar', { duration: 3000 });
      });
    } else {
      // Fallback para navegadores antigos
      const textarea = document.createElement('textarea');
      textarea.value = texto;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        this.snackBar.open('URL copiada para a área de transferência!', 'Fechar', { duration: 3000 });
      } catch (err) {
        this.snackBar.open('Falha ao copiar URL', 'Fechar', { duration: 3000 });
      }
      document.body.removeChild(textarea);
    }
  }
}

@Component({
  selector: 'dialog-inscricao-afilhado',
  templateUrl: 'dialog-inscricao-afilhado.html',
  styleUrls: ['./lista-inscricao.scss'],
  imports: [CommonModule, MatDialogModule, MatCardModule, MatCheckboxModule, MatButtonModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSpinner, ReactiveFormsModule, MatIconModule],
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
      evento_id: this.data.eventos, // Preenche com o evento selecionado
      url_inscricao: ['']
    });
  }

  conviteForm: FormGroup;
  readonly dialogRef = inject(MatDialogRef<DialogConviteAfilhado>);
  readonly data = inject<{ casais: Casal[], eventos: number }>(MAT_DIALOG_DATA);
  readonly listaCasais = this.data.casais;
  readonly eventos = this.data.eventos;
  readonly afilhado = new FormControl(false);


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


@Component({
  selector: 'dialog-confirmar-exclusao',
  template: `
    <h2 mat-dialog-title>Confirmar Exclusão</h2>
    <mat-dialog-content>
      Tem certeza que deseja excluir esta inscrição?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">Excluir</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, CommonModule],
})
export class DialogConfirmarExclusao {
  constructor(
    public dialogRef: MatDialogRef<DialogConfirmarExclusao>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
