import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CasalService } from '../../../core/services/casal.service';
import { Casal } from '../../../core/models/casal.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-casal-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './casal-list.component.html',
    styles: [`
    .container { padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    table { width: 100%; }
    .action-button { margin-left: 8px; }
  `]
})
export class CasalListComponent implements OnInit {
    casais: Casal[] = [];
    displayedColumns: string[] = ['nome_esposo', 'nome_esposa', 'telefone', 'acoes'];

    private casalService = inject(CasalService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);

    ngOnInit(): void {
        this.loadCasais();
    }

    loadCasais(): void {
        this.casalService.getCasais().subscribe({
            next: (data) => this.casais = data,
            error: (err) => console.error('Erro ao carregar casais', err)
        });
    }

    deleteCasal(casal: Casal): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Excluir Casal',
                message: `Tem certeza que deseja excluir o casal?`
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && casal.id) {
                this.casalService.deleteCasal(casal.id).subscribe(() => {
                    this.snackBar.open('Casal excluído com sucesso!', 'Fechar', { duration: 3000 });
                    this.loadCasais();
                });
            }
        });
    }

    getNomeEsposo(casal: Casal): string {
        return casal.esposo?.nome_social || casal.esposo?.nome_completo || '-';
    }

    getNomeEsposa(casal: Casal): string {
        return casal.esposa?.nome_social || casal.esposa?.nome_completo || '-';
    }
}
