import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

import { EventoService } from '../../../core/services/evento.service';
import { CreateEventoRequest, Evento } from '../../../core/models/evento.model';

@Component({
    selector: 'app-evento-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatInputModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatIconModule,
        MatCardModule
    ],
    templateUrl: './evento-form.component.html',
    styles: [`
    .container { padding: 20px; max-width: 800px; margin: 0 auto; }
    .row { display: flex; gap: 16px; flex-wrap: wrap; }
    .col { flex: 1; min-width: 200px; }
    .full-width { width: 100%; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
    .rule-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .delete-btn { color: #f44336; }
  `]
})
export class EventoFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    eventoId?: number;
    isLoading = false;

    private fb = inject(FormBuilder);
    private eventoService = inject(EventoService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);

    constructor() {
        this.form = this.fb.group({
            evento: this.fb.group({
                nome: ['', Validators.required],
                data_inicio: ['', Validators.required],
                data_fim: ['', Validators.required],
                local: ['', Validators.required],
                capacidade_maxima: [30, [Validators.required, Validators.min(1)]],
                status: ['planejado', Validators.required]
            }),
            regras_devolucao: this.fb.array([])
        });
    }

    get regrasArray() {
        return this.form.get('regras_devolucao') as FormArray;
    }

    ngOnInit(): void {
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.isEditMode = true;
            this.eventoId = +id;
            this.loadEvento(this.eventoId);
        }
    }

    addRegra(): void {
        const regra = this.fb.group({
            id: [null],
            data_limite: ['', Validators.required],
            percentual_devolucao: [100, [Validators.required, Validators.min(0), Validators.max(100)]]
        });
        this.regrasArray.push(regra);
    }

    removeRegra(index: number): void {
        this.regrasArray.removeAt(index);
    }

    loadEvento(id: number): void {
        this.isLoading = true;
        this.eventoService.getEvento(id).subscribe({
            next: (evento) => {
                // Since API returns pure Evento, and we need rules (which might be fetched separately or included?)
                // The API doc implies CreateRequest has rules, but specific GET Evento usually returns them too if designed well.
                // Assuming GET includes rules or we need to fetch them? 
                // Docs: "Obter um evento pelo ID" -> Response 200 OK. Model RegraDevolucao has evento_id.
                // Assuming the Evento object returned MIGHT have 'regras_devolucao' property if backend supports eager loading.
                // If not, we might miss them. For now, let's assume standard REST behavior or we patch what we can.

                // Note: The PROPOSED models had RegraDevolucao linked.

                this.form.get('evento')?.patchValue(evento);

                // If the API returns 'regras_devolucao' attached:
                if ((evento as any).regras_devolucao) {
                    this.regrasArray.clear();
                    (evento as any).regras_devolucao.forEach((r: any) => {
                        const grp = this.fb.group({
                            id: [r.id],
                            data_limite: [r.data_limite, Validators.required],
                            percentual_devolucao: [r.percentual_devolucao, Validators.required]
                        });
                        this.regrasArray.push(grp);
                    });
                }

                this.isLoading = false;
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open('Erro ao carregar evento', 'Fechar', { duration: 3000 });
                this.isLoading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const formValue = this.form.value;
        const request: CreateEventoRequest = {
            evento: formValue.evento,
            regras_devolucao: formValue.regras_devolucao
        };

        if (this.isEditMode && this.eventoId) {
            this.eventoService.updateEvento(this.eventoId, request).subscribe({
                next: () => {
                    this.snackBar.open('Evento atualizado!', 'Fechar', { duration: 3000 });
                    this.router.navigate(['/eventos']);
                },
                error: (err) => console.error(err)
            });
        } else {
            this.eventoService.createEvento(request).subscribe({
                next: () => {
                    this.snackBar.open('Evento criado!', 'Fechar', { duration: 3000 });
                    this.router.navigate(['/eventos']);
                },
                error: (err) => console.error(err)
            });
        }
    }
}
