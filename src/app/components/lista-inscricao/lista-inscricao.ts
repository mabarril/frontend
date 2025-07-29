import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
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
import { MatMenuModule } from '@angular/material/menu';
import { Utils } from '../../services/utils';
import { ExcelExportService } from '../../services/excel-export.service';
import { ListaFilhos } from '../lista-filhos/lista-filhos';
import { jsPDF } from 'jspdf';

interface Casal {
  id: number;
  nome_esposo: string;
  nome_esposa: string;
  // email_contato: string;
}

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  formatter?: (value: any) => string;
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
  padrinho_id?: number; // Campo opcional para o padrinho
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
    FichaPdfComponent,
    MatMenuModule,
  ],
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
  private casaisMap: Map<number, any> = new Map();
  private destroy$ = new Subject<void>();
  utils = Utils;
  relacaoCasais: any[] = [];
  listaFilho = ListaFilhos;
  
  constructor(
    private casaisService: CasaisService,
    private inscricoesService: InscricoesService,
    private eventosService: EventosService,
    private urlsUnicasService: UrlsUnicasService,
    private router: Router,
    private snackBar: MatSnackBar,
    private excelExportService: ExcelExportService // Injeção do serviço de exportação
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

  carregaListaCasais(casais: any[]): void {
    this.relacaoCasais = [...casais];
    console.log('rel ', this.relacaoCasais);
    this.listaCasais = casais.map(casal => {
      const esposo = casal.pessoas.find((p: any) => p.tipo === 'esposo')?.nome_social || '';
      const esposa = casal.pessoas.find((p: any) => p.tipo === 'esposa')?.nome_social || '';
      return {
        id: casal.id,
        nome: esposo + ' e ' + esposa,
        nome_esposo: esposo + ' da ' + esposa,
        nome_esposa: esposa + ' do ' + esposo,
        dados: casal
      };
    }).sort((a, b) => {
      const nomeA = a.nome_esposo.toLowerCase();
      const nomeB = b.nome_esposo.toLowerCase();
      if (nomeA !== nomeB) return nomeA.localeCompare(nomeB);
      return a.nome_esposa.toLowerCase().localeCompare(b.nome_esposa.toLowerCase());
    });
    this.casaisMap = new Map(this.listaCasais.map(casal => [casal.id, casal]));
  }

  private carregaInscricoes() {
    const eventoId = this.eventosService.getEventoSelecionado();
    if (!eventoId) return;
    this.inscricoesService.getInscricoesDoEvento(eventoId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.inscricoes = response || [];
        this.listaInscritos = this.inscricoes.map(inscricao => {
          const casal = this.casaisMap.get(inscricao.casal_id);
          return {
            id: inscricao.id,
            casal_id: inscricao.casal_id,
            evento_id: inscricao.evento_id,
            status: inscricao.status === 'confirmada' ? 'Confirmada' : 'Pendente',
            data_inscricao: inscricao.data_inscricao,
            tipo_participante: inscricao.tipo_participante,
            padrinho_id: inscricao.padrinho_id,
            casal: casal,
          };
        });
        this.listaInscritos.sort((a, b) => a.casal.nome.localeCompare(b.casal.nome));
        this.listaInscritosOriginal = [...this.listaInscritos];
        console.log('Lista de inscritos:', this.listaInscritos);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro ao carregar inscrições:', error);
        this.snackBar.open('Erro ao carregar inscrições', 'Fechar', { duration: 3000 });
      }
    });
  }

  onEventoChange() {
    this.eventosService.setEventoSelecionado(this.eventoSelecionado || 0);
    this.carregaInscricoes();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.listaInscritos = this.listaInscritosOriginal.filter(casal =>
      casal.casal.nome.toLowerCase().includes(filterValue)
    );
  }

  editarCasal(casalId: number) {
    this.router.navigate(['/registro', casalId]);
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

  listaSeguro() {
    let listaSeguro: any[] = [];
    this.listaInscritos.map(participante => {
      participante.casal.dados.pessoas.map((pessoa: any) => {
        listaSeguro.push({
          nome: pessoa.nome_completo,
          cpf: pessoa.cpf,
          data_nascimento: this.utils.formatarData(pessoa.data_nascimento),
          rg: pessoa.rg,
          orgao_emissor: pessoa.rg_emissor,
        });
      });
    });

    const columns: ExportColumn[] = [
      { key: 'nome', header: 'Nome', width: 30 },
      { key: 'cpf', header: 'CPF', width: 25 },
      { key: 'data_nascimento', header: 'Dt. Nascimento', width: 20 },
      { key: 'rg', header: 'Identidade', width: 18 },
      { key: 'orgao_emissor', header: 'Orgão Emissor', width: 18 }
    ];

    listaSeguro.sort((a, b) => a.nome.localeCompare(b.nome));
    this.excelExportService.exportToExcel(listaSeguro, columns);
  }

  formataCpf(valor: string) {
    valor = valor.replace(/(\.|\/|\-)/g, "");
    return valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "\$1.\$2.\$3\-\$4");
  }

  listaOnibus() {
    const novaRelacao: any[] = [];
    this.listaInscritos.forEach((casal: any) => {
      // A interface Pessoa é uma suposição, ajuste se o tipo for outro.
      if (casal.tipo_participante === "convidado" || casal.casal_id === 247) {
        const esposo = casal.casal.dados.pessoas.find((p: any) => p.tipo === 'esposo');
        const esposa = casal.casal.dados.pessoas.find((p: any) => p.tipo === 'esposa');

        if (esposo) {
          novaRelacao.push({
            nome: esposo.nome_completo ?? '',
            rg: esposo.rg ?? '',
            orgao: esposo.rg_emissor ?? '',
            cpf: this.formataCpf(esposo.cpf) ?? '',
          });
        }

        if (esposa) {
          novaRelacao.push({
            nome: esposa.nome_completo ?? '',
            rg: esposa.rg ?? '',
            orgao: esposa.rg_emissor ?? '',
            cpf: this.formataCpf(esposa.cpf) ?? '',
          });
        }
      }
    });
    novaRelacao.sort((a, b) => a.nome.localeCompare(b.nome));

    let pdf = new jsPDF();
    pdf.rect(15, 10, 180, 15); // empty square
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(`ENCONTRO DE CASAIS COM CRISTO (ECC)`, 105, 15, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.text(`Relacao de Passageiros - 01/08/25 a 03/08/25`, 105, 22, { align: 'center' });

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`Origem: Brasília - DF`, 20, 35, { align: 'left' });
    pdf.text(`Destino: Brasília - DF`, 105, 35, { align: 'left' })

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);

    let linha = 40;
    for (const item of novaRelacao) {
      linha += 5;
      pdf.text(item.nome, 20, linha);
      pdf.text(item.rg, 105, linha);
      pdf.text(item.orgao, 135, linha);
      pdf.text(item.cpf, 160, linha);
    }

    pdf.save('lista.pdf');

    const columns: ExportColumn[] = [
      { key: 'nome', header: 'Nome', width: 30 },
      { key: 'rg', header: 'Identidade', width: 18 },
      { key: 'orgao_emissor', header: 'Orgão Emissor', width: 18 },
      { key: 'cpf', header: 'CPF', width: 25 }
    ];

    this.excelExportService.exportToExcel(novaRelacao, columns, {filename: 'Lista Passageiros'});

  }
  // ========== MÉTODOS DE EXPORTAÇÃO PARA EXCEL ==========

  /**
   * Exporta a lista completa de inscritos para Excel
   */
  exportarListaInscritosExcel(): void {
    try {
      if (!this.listaInscritos || this.listaInscritos.length === 0) {
        this.snackBar.open('Nenhum dado disponível para exportação', 'Fechar', { duration: 3000 });
        return;
      }

      const nomeEvento = this.getNomeEventoSelecionado();
      this.excelExportService.exportListaInscritos(this.listaInscritos, nomeEvento);

      this.snackBar.open('Lista de inscritos exportada com sucesso!', 'Fechar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Erro ao exportar lista de inscritos:', error);
      this.snackBar.open('Erro ao exportar lista de inscritos', 'Fechar', { duration: 3000 });
    }
  }

  /**
   * Exporta lista de dietas alimentares para Excel
   */
  exportarListaDietasExcel(): void {
    try {
      this.excelExportService.exportListaDietas(this.listaInscritos);
      this.snackBar.open('Lista de dietas alimentares exportada com sucesso!', 'Fechar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Erro ao exportar lista de dietas:', error);
      this.snackBar.open('Erro ao exportar lista de dietas', 'Fechar', { duration: 3000 });
    }
  }

  /**
   * Exporta lista de diabéticos para Excel
   */
  exportarListaDiabeticosExcel(): void {
    try {
      this.excelExportService.exportListaDiabeticos(this.listaInscritos);
      this.snackBar.open('Lista de diabéticos exportada com sucesso!', 'Fechar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Erro ao exportar lista de diabéticos:', error);
      this.snackBar.open('Erro ao exportar lista de diabéticos', 'Fechar', { duration: 3000 });
    }
  }

  /**
   * Exporta lista de afilhados para Excel
   */
  exportarListaAfilhadosExcel(): void {
    try {
      this.excelExportService.exportListaAfilhados(this.listaInscritos, this.casaisMap);
      this.snackBar.open('Lista de afilhados exportada com sucesso!', 'Fechar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Erro ao exportar lista de afilhados:', error);
      this.snackBar.open('Erro ao exportar lista de afilhados', 'Fechar', { duration: 3000 });
    }
  }

  /**
   * Obtém o nome do evento selecionado
   */
  private getNomeEventoSelecionado(): string {
    if (!this.eventoSelecionado) return '';
    const evento = this.eventos.find(e => e.id === this.eventoSelecionado);
    return evento?.nome || '';
  }

  // ========== MÉTODOS ORIGINAIS MANTIDOS ==========

  geraListaRestaurante() {
    let listaRestaurante: any[] = [];
    this.listaInscritos.map(participante => {
      participante.casal.dados.pessoas.map((pessoa: any) => {
        if (pessoa.dieta_alimentar !== "não") {
          let nome = '';
          if (pessoa.tipo === 'esposo') {
            nome = participante.casal.nome_esposo;
          } else {
            nome = participante.casal.nome_esposa;
          }
          listaRestaurante.push({
            nome: nome,
            dieta: pessoa.dieta_alimentar,
            tipo: participante.tipo_participante,
          });
        }
      });
    });
    const col = ['nome', 'dieta', 'tipo'];
    listaRestaurante.sort((a, b) => a.nome.localeCompare(b.nome));
    this.utils.generatePdf(col, listaRestaurante, 'Dieta Alimentar');
  }

  geraListaDiabeticos() {
    let listaDiabeticos: any[] = [];
    this.listaInscritos.map(participante => {
      participante.casal.dados.pessoas.map((pessoa: any) => {
        if (pessoa.diabetico === true) {
          let nome = '';
          if (pessoa.tipo === 'esposo') {
            nome = participante.casal.nome_esposo;
          } else {
            nome = participante.casal.nome_esposa;
          }
          listaDiabeticos.push({
            nome: nome,
            diabético: "SIM",
            tipo: participante.tipo_participante,
          });
        }
      });
    });
    const col = ['nome', 'diabético', 'tipo'];
    listaDiabeticos.sort((a, b) => a.nome.localeCompare(b.nome));
    this.utils.generatePdf(col, listaDiabeticos, 'Lista Diabéticos');
  }

  geraListaAfilhados() {
    let listaAfilhados: any[] = [];
    this.listaInscritos.filter(inscricao => inscricao.tipo_participante === 'convidado').forEach(participante => {
      listaAfilhados.push({
        convidado: participante.casal.nome,
        padrinho: participante.padrinho_id ? this.casaisMap.get(participante.padrinho_id)?.nome : 'Não definido',
      }
      );
    });
    const col = ['convidado', 'padrinho'];
    listaAfilhados.sort((a, b) => a.convidado.localeCompare(b.convidado));
    this.utils.generatePdf(col, listaAfilhados, 'Lista Afilhados');
  }

  listarFilhos() {
    let relacaoFilhos: any[] = [];
    let listaAfilhados = this.listaInscritos.filter(inscricao => inscricao.tipo_participante === 'convidado');
    listaAfilhados.forEach(afilhado => {
      this.casaisService.getCasaisById(afilhado.casal_id).subscribe({
        next: (casal: any) => {
          if (casal && casal.filhos && casal.filhos.length > 0) {
            let filhos: { nome_completo: any; data_nascimento: any; }[] = [];
            casal.filhos.forEach((filho: any) => {
              filhos.push({
                nome_completo: filho.nome_completo.toUpperCase(),
                data_nascimento: this.utils.formatarData(filho.data_nascimento),
              });
            });
            let reg = {
              nome: afilhado.casal.nome,
              filhos: [...filhos]
            };
            relacaoFilhos.push(reg);
          }
        },
        error: () => {
          console.error('Erro ao buscar dados do filho');
        }
      });
    })
    this.listaFilho.gerarPDF(relacaoFilhos);
  }

  openDialogInscricao(enterAnimationDuration: string, exitAnimationDuration: string): void {
    const dialogRef = this.dialog.open(DialogInscricao, {
      data: { casais: this.listaCasais, eventos: this.eventoSelecionado },
      width: '500px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
    dialogRef.afterClosed().subscribe(() => {
      this.ngOnInit(); // Recarrega os dados após o fechamento do diálogo
    });
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

  cadastrarCasal() {
    this.router.navigate(['/registro']);
  }

  generatePdf() {
    let col = [...this.displayedColumns];
    col.pop(); // Remove 'actions' column for PDF export
    let lista = this.listaInscritos.map(inscricao => {
      return {
        id: inscricao.id,
        tipo_participante: inscricao.tipo_participante,
        status: inscricao.status,
        nome: inscricao.casal.nome
      };
    });
    this.utils.generatePdf(col, lista, 'Lista de Inscritos');
  }
}

// ========== COMPONENTES DE DIÁLOGO MANTIDOS ==========

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
    private eventosService: EventosService
  ) {
    this.conviteForm = this.fb.group({
      casal_id: ['', Validators.required],
      padrinho_id: [''], // Campo para selecionar o padrinho
      evento_id: this.data.eventos, // Preenche com o evento selecionado
      url_inscricao: [''],
    });
  }

  changeAfilhado() {
    this.afilhado = !this.afilhado;
  }

  conviteForm: FormGroup;
  readonly dialogRef = inject(MatDialogRef<DialogInscricao>);
  readonly data = inject<{ casais: any[], eventos: number }>(MAT_DIALOG_DATA);
  readonly listaCasais = this.data.casais;
  readonly eventos = this.data.eventos;
  readonly inscricao = new FormControl(false);

  urlCompleta = '';
  casalAtual: Casal | undefined;
  loading = false;
  enviandoConvite = false;
  afilhado = false;

  inscreverCasal(): void {
    this.enviandoConvite = true;
    let inscricao = {
      casal_id: this.conviteForm.value.casal_id,
      evento_id: this.eventosService.getEventoSelecionado(),
      tipo_participante: this.afilhado ? 'convidado' : 'encontrista',
      status: 'pendente',
      padrinho_id: this.afilhado ? this.conviteForm.value.padrinho_id : 0,
    };

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
    public dialogRef: MatDialogRef<DialogConfirmarExclusao>
  ) { }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

