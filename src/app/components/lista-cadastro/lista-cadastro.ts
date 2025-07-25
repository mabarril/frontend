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
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import jsPDF autotable plugin

interface Casal {
  id: number;
  nome_esposo: string;
  nome_esposa: string;
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
  templateUrl: './lista-cadastro.html',
  styleUrl: './lista-cadastro.scss'
})

export class ListaCadastro implements OnInit {


  urlCompleta: string = '';
  readonly dialog = inject(MatDialog);
  listaCasais: Casal[] = [];
  listaCasaisOriginal: Casal[] = [];
  loading = false;
  eventoSelecionado: number | null = null;
  displayedColumns: string[] = ['id', 'casal', 'actions'];
  fichaPdf?: FichaPdfComponent;
  private casaisMap: Map<number, Casal> = new Map();
  private destroy$ = new Subject<void>();

  constructor(
    private casaisService: CasaisService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.carregarDados();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  // private carregaInscricoes() {
  //   if (!eventoId) return;
  //   this.inscricoesService.getInscricoesDoEvento(eventoId).pipe(takeUntil(this.destroy$)).subscribe({
  //     next: (response: any) => {
  //       this.inscricoes = response || [];
  //       this.listaInscritos = this.inscricoes.map(inscricao => {
  //         const casal = this.casaisMap.get(inscricao.casal_id);
  //         return {
  //           id: inscricao.id,
  //           casal_id: inscricao.casal_id,
  //           evento_id: inscricao.evento_id,
  //           status: inscricao.status === 'confirmada' ? 'Confirmada' : 'Pendente',
  //           data_inscricao: inscricao.data_inscricao,
  //           tipo_participante: inscricao.tipo_participante,
  //           nome: casal ? `${casal.nome_esposo} e ${casal.nome_esposa}` : 'Casal não encontrado',
  //           email: casal?.email_contato || 'Email não disponível'
  //         };
  //       });
  //       this.listaInscritosOriginal = [...this.listaInscritos];
  //     },
  //     error: (error: HttpErrorResponse) => {
  //       console.error('Erro ao carregar inscrições:', error);
  //       this.snackBar.open('Erro ao carregar inscrições', 'Fechar', { duration: 3000 });
  //     }
  //   });
  // }

  editarCasal(casalId: number) {
    this.router.navigate(['/registro', casalId]);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.listaCasais = this.listaCasaisOriginal.filter(casal =>
      casal.nome_esposa.toLowerCase().includes(filterValue) || casal.nome_esposo.toLowerCase().includes(filterValue)
    );
  }

 
  carregarDados(): void {
    this.loading = true;
    forkJoin({
      casais: this.casaisService.getCasais(),
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ casais }) => {
        this.carregaListaCasais(casais);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados:', error);
        this.snackBar.open('Erro ao carregar dados', 'Fechar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // openDialogInscricao(enterAnimationDuration: string, exitAnimationDuration: string): void {
  //   const dialogRef = this.dialog.open(DialogInscricao, {
  //     data: { casais: this.listaCasais, eventos: this.eventoSelecionado },
  //     width: '500px',
  //     enterAnimationDuration,
  //     exitAnimationDuration,
  //   });
  //   dialogRef.afterClosed().subscribe(() => {
  //     this.ngOnInit(); // Recarrega os dados após o fechamento do diálogo
  //   });
  // }



  carregaListaCasais(casais: any[]): void {
    this.listaCasais = casais.map(casal => {
      const esposo = casal.pessoas.find((p: any) => p.tipo === 'esposo')?.nome_social || '';
      const esposa = casal.pessoas.find((p: any) => p.tipo === 'esposa')?.nome_social || '';
      return {
        id: casal.id,
        nome_esposo: esposo,
        nome_esposa: esposa        
      };
    }).sort((a, b) => {
      const nomeA = a.nome_esposo.toLowerCase();
      const nomeB = b.nome_esposo.toLowerCase();
      if (nomeA !== nomeB) return nomeA.localeCompare(nomeB);
      return a.nome_esposa.toLowerCase().localeCompare(b.nome_esposa.toLowerCase());
    });
    this.casaisMap = new Map(this.listaCasais.map(casal => [casal.id, casal]));
    this.listaCasaisOriginal = [...this.listaCasais];
  }

 
  cadastrarCasal() {
    this.router.navigate(['/registro']);
  }

  generatePdf() {
    const doc = new jsPDF();

    // Prepare table headers
    const head = [this.displayedColumns.map(col => col.toUpperCase())]; // Capitalize for headers

    // Prepare table body data
    // const body = this.listaCasais.map(row => this.displayedColumns.map(col => row[col]));

    autoTable(doc, {
      head: head,
      // body: body,
      startY: 20, // Starting Y position for the table
      theme: 'striped', // Optional: 'striped', 'grid', 'plain'
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185], // Example header background color
        textColor: 255, // White text
        fontStyle: 'bold',
      },
    });

    doc.save('mat-table-export.pdf');
  }
}