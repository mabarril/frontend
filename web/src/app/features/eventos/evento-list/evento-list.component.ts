import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { EventoService } from '../../../core/services/evento.service';
import { Evento } from '../../../core/models/evento.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-evento-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule
    ],
    templateUrl: './evento-list.component.html',
    styles: [`
    .container { padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    table { width: 100%; }
    .action-button { margin-left: 8px; }
  `]
})
export class EventoListComponent implements OnInit {
    eventos: Evento[] = [];
    displayedColumns: string[] = ['nome', 'data_inicio', 'local', 'status', 'acoes'];

    private eventoService = inject(EventoService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);

    ngOnInit(): void {
        this.loadEventos();
    }

    loadEventos(): void {
        this.eventoService.getEventos().subscribe({
            next: (data) => this.eventos = data,
            error: (err) => console.error('Erro ao carregar eventos', err)
        });
    }

    deleteEvento(evento: Evento): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Excluir Evento',
                message: `Tem certeza que deseja excluir o evento "${evento.nome}"?`
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && evento.id) {
                this.eventoService.deleteEvento(evento.id).subscribe(() => {
                    this.snackBar.open('Evento excluído com sucesso!', 'Fechar', { duration: 3000 });
                    this.loadEventos();
                });
            }
        });
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'planejado': return 'accent';
            case 'inscricoes_abertas': return 'primary';
            case 'em_andamento': return 'warn';
            case 'concluido': return '';
            default: return '';
        }
    }
}
