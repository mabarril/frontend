import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { InscricaoService } from '../../../core/services/inscricao.service';
import { EventoService } from '../../../core/services/evento.service';
import { Inscricao } from '../../../core/models/inscricao.model';
import { Evento } from '../../../core/models/evento.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-inscricao-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatCardModule
    ],
    templateUrl: './inscricao-list.component.html',
    styles: [`
    .container { padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .filter-section { margin-bottom: 20px; }
    table { width: 100%; }
    .action-button { margin-left: 8px; }
  `]
})
export class InscricaoListComponent implements OnInit {
    inscricoes: Inscricao[] = [];
    eventos: Evento[] = [];
    selectedEventoId: number | null = null;
    displayedColumns: string[] = ['casal', 'tipo', 'status', 'acoes'];

    private inscricaoService = inject(InscricaoService);
    private eventoService = inject(EventoService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);

    ngOnInit(): void {
        this.loadEventos();
    }

    loadEventos(): void {
        this.eventoService.getEventos().subscribe({
            next: (data) => {
                this.eventos = data;
                // Auto select first active event if available, or just the first one
                if (this.eventos.length > 0) {
                    // Try to find one with 'inscricoes_abertas'
                    const active = this.eventos.find(e => e.status === 'inscricoes_abertas');
                    this.selectedEventoId = active ? active.id! : this.eventos[0].id!;
                    this.loadInscricoes();
                }
            },
            error: (err) => console.error(err)
        });
    }

    loadInscricoes(): void {
        if (!this.selectedEventoId) return;

        this.inscricaoService.getInscricoesPorEvento(this.selectedEventoId).subscribe({
            next: (data) => this.inscricoes = data,
            error: (err) => {
                console.error(err);
                this.inscricoes = []; // Clear on error or empty
            }
        });
    }

    onEventoChange(): void {
        this.loadInscricoes();
    }

    deleteInscricao(inscricao: Inscricao): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Excluir Inscrição',
                message: `Tem certeza que deseja excluir esta inscrição?`
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && inscricao.id) {
                this.inscricaoService.deleteInscricao(inscricao.id).subscribe(() => {
                    this.snackBar.open('Inscrição excluída!', 'Fechar', { duration: 3000 });
                    this.loadInscricoes();
                });
            }
        });
    }
}
