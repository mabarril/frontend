import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, inject, OnInit, OnDestroy } from '@angular/core';
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
import { MatLabel } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { CasaisService } from '../../services/casais.service';
import { EventosService } from '../../services/eventos.service';
import { InscricoesService } from '../../services/inscricoes.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { FichaPdfComponent } from '../ficha-pdf/ficha-pdf';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { initialConfig } from 'ngx-mask';

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

// Serviço para exibir snackbars
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
    FichaPdfComponent,],
  templateUrl: './lista-inscricao.html',
  styleUrl: './lista-inscricao.scss'
})

export class ListaInscricao implements OnInit {
  urlCompleta: string = '';
  readonly dialog = inject(MatDialog);
  listaCasais: Casal[] = [];
  eventos: Evento[] = [];
  loading = false;
  eventoSelecionado: number | null = null;
  inscricoes: Inscricao[] = [];
  listaInscritos: any[] = [];
  listaInscritosOriginal: any[] = [];
  displayedColumns: string[] = ['id', 'nome', 'tipo_participante', 'status', 'actions'];
  fichaPdf?: FichaPdfComponent;
  private casaisMap: Map<number, Casal> = new Map();
  private destroy$ = new Subject<void>();

  constructor(
    private casaisService: CasaisService,
    private inscricoesService: InscricoesService,
    private eventosService: EventosService,
    private urlsUnicasService: UrlsUnicasService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    const eventoSalvo = this.eventosService.getEventoSelecionado();
    if (eventoSalvo) {
      this.eventoSelecionado = eventoSalvo;
    }
    this.carregarDados();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  imprimirTodasFichas(evento: number | null) {
    if (!evento) {
      this.snackBar.open('Selecione um evento para imprimir as fichas', 'Fechar', { duration: 3000 });
      return;
    }
    this.listaInscritos.forEach(inscrito => {
      this.fichaPdf?.buscarCasalEExibirPDF(inscrito.casal_id);
    });
  }

  onEventoChange() {
    if (!this.eventosService.getEventoSelecionado()) {
      this.eventosService.setEventoSelecionado(this.eventoSelecionado || 0);
    }
    this.carregaInscricoes();
  }

  private carregaInscricoes() {
    const eventoId = this.eventosService.getEventoSelecionado();
    if (!eventoId) return;
    this.inscricoesService.getInscricoesDoEvento(eventoId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.inscricoes = response || [];
        this.listaInscritos = this.inscricoes.map(inscricao => {
          console.log('inscricao', inscricao);
          const casal = this.casaisMap.get(inscricao.casal_id);
          console.log('casal', casal);
          return {
            id: inscricao.id,
            casal_id: inscricao.casal_id,
            evento_id: inscricao.evento_id,
            status: inscricao.status === 'confirmada' ? 'Confirmada' : 'Pendente',
            data_inscricao: inscricao.data_inscricao,
            tipo_participante: inscricao.tipo_participante,
            nome: casal ? `${casal.nome_esposo} e ${casal.nome_esposa}` : 'Casal não encontrado',
            email: casal?.email_contato || 'Email não disponível'
          };
        });
        this.listaInscritosOriginal = [...this.listaInscritos];
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro ao carregar inscrições:', error);
        this.snackBar.open('Erro ao carregar inscrições', 'Fechar', { duration: 3000 });
      }
    });
  }

  editarCasal(casalId: number) {
    this.router.navigate(['/registro', casalId]);
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
        this.inscricoesService.deletarInscricao(inscricaoId).subscribe({
          next: () => {
            this.snackBar.open('Inscrição excluída com sucesso!', 'Fechar', { duration: 3000 });
            this.onEventoChange();
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
    forkJoin({
      casais: this.casaisService.getCasais(),
      eventos: this.eventosService.getEventos()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ casais, eventos }) => {
        this.carregaListaCasais(casais);
        this.eventos = (eventos as Evento[] || []).sort((a: Evento, b: Evento) => b.id - a.id);
        this.loading = false;
        if (this.eventoSelecionado) {
          this.carregaInscricoes();
        }
      },
      error: (error) => {
        console.error('Erro ao carregar dados:', error);
        this.snackBar.open('Erro ao carregar dados', 'Fechar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  openDialogInscricao(enterAnimationDuration: string, exitAnimationDuration: string): void {
    const dialogRef = this.dialog.open(DialogInscricao, {
      data: { casais: this.listaCasais, eventos: this.eventoSelecionado },
      width: '500px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
    dialogRef.afterClosed().subscribe(() => {
      this.onEventoChange();
    });
  }

  carregaListaCasais(casais: any[]): void {
    this.listaCasais = casais.map(casal => {
      const esposo = casal.pessoas.find((p: any) => p.tipo === 'esposo')?.nome_social || '';
      const esposa = casal.pessoas.find((p: any) => p.tipo === 'esposa')?.nome_social || '';
      return {
        id: casal.id,
        nome_esposo: esposo,
        nome_esposa: esposa,
        email_contato: casal.email_contato || ''
      };
    }).sort((a, b) => {
      const nomeA = a.nome_esposo.toLowerCase();
      const nomeB = b.nome_esposo.toLowerCase();
      if (nomeA !== nomeB) return nomeA.localeCompare(nomeB);
      return a.nome_esposa.toLowerCase().localeCompare(b.nome_esposa.toLowerCase());
    });
    this.casaisMap = new Map(this.listaCasais.map(casal => [casal.id, casal]));
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
  }

  copiarParaClipboard(texto: string) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(texto).then(() => {
        this.snackBar.open('URL copiada para a área de transferência!', 'Fechar', { duration: 3000 });
      }, (err) => {
        console.error('Erro ao copiar para a área de transferência:', err);
        this.snackBar.open('Falha ao copiar URL para a área de transferência', 'Fechar', { duration: 3000 });
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = texto;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        this.snackBar.open('URL copiada para a área de transferência!', 'Fechar', { duration: 3000 });
      } catch (err) {
        console.error('Erro ao copiar para a área de transferência (fallback):', err);
        this.snackBar.open('Falha ao copiar URL para a área de transferência', 'Fechar', { duration: 3000 });
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }
}

@Component({
  selector: 'dialog-inscricao',
  templateUrl: 'dialog-inscricao.html',
  styleUrls: ['./lista-inscricao.scss'],
  imports: [CommonModule, MatDialogModule, MatCardModule, MatCheckboxModule, MatButtonModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogInscricao {

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private urlsUnicasService: UrlsUnicasService,
    private inscricoesService: InscricoesService,

  ) {
    this.conviteForm = this.fb.group({
      casal_id: ['', Validators.required],
      evento_id: this.data.eventos, // Preenche com o evento selecionado
      url_inscricao: ['']
    });
  }



  conviteForm: FormGroup;
  readonly dialogRef = inject(MatDialogRef<DialogInscricao>);
  readonly data = inject<{ casais: Casal[], eventos: number }>(MAT_DIALOG_DATA);
  readonly listaCasais = this.data.casais;
  readonly eventos = this.data.eventos;
  readonly inscricao = new FormControl(false);


  urlCompleta = '';
  casalAtual: Casal | undefined;
  loading = false;
  enviandoConvite = false;

  inscreverCasal(): void {
    this.enviandoConvite = true;
    let inscricao = {
      casal_id: this.conviteForm.value.casal_id,
      evento_id: this.eventos,
      tipo_participante: 'participante',
      status: 'pendente',
    };

    console.log(inscricao);
    this.inscricoesService.registrarInscricao(inscricao)
      .subscribe({
        next: (response: any) => {
          this.enviandoConvite = false;
          this.conviteForm.value.url_inscricao = response.data.urlCompleta;
          this.urlCompleta = response.data.urlCompleta;

          if (response && response.data && response.data[0]) {
            this.snackBar.open('Inscrição realizada com sucesso!', 'Fechar', {
              duration: 5000,
              panelClass: ['success-snackbar']
            });
            this.dialogRef.close();
          }
        },
        error: (error) => {
          this.enviandoConvite = false;
          console.error('Erro ao inscrever casal:', error);
          this.snackBar.open(
            error.error?.message || 'Erro ao inscrever casal',
            'Fechar',
            { duration: 3000 }
          );
        }
      });
  }

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
