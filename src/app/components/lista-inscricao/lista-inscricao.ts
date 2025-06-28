import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
    MatCardModule
  ],
  templateUrl: './lista-inscricao.html',
  styleUrl: './lista-inscricao.scss'
})

export class ListaInscricao {
  readonly dialog = inject(MatDialog);
  listaCasais!: any;
  eventos: any;
  loading = false;
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
  styleUrls: ['./lista-inscricao.scss'],
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
