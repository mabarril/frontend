import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { InscricaoService } from '../../../core/services/inscricao.service';
import { EventoService } from '../../../core/services/evento.service';
import { CasalService } from '../../../core/services/casal.service';
import { CreateInscricaoRequest, Inscricao } from '../../../core/models/inscricao.model';
import { Evento } from '../../../core/models/evento.model';
import { Casal } from '../../../core/models/casal.model';

import { Observable, combineLatest } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
    selector: 'app-inscricao-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatIconModule,
        MatCardModule,
        MatCheckboxModule
    ],
    templateUrl: './inscricao-form.component.html',
    styles: [`
    .container { padding: 20px; max-width: 600px; margin: 0 auto; }
    .row { display: flex; gap: 16px; flex-wrap: wrap; }
    .col { flex: 1; min-width: 200px; }
    .full-width { width: 100%; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  `]
})
export class InscricaoFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    inscricaoId?: number;
    isLoading = false;

    eventos: Evento[] = [];
    casais: Casal[] = [];
    filteredCasais!: Observable<Casal[]>;

    private fb = inject(FormBuilder);
    private inscricaoService = inject(InscricaoService);
    private eventoService = inject(EventoService);
    private casalService = inject(CasalService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);

    constructor() {
        this.form = this.fb.group({
            casal_id: ['', Validators.required], // Store ID or object? For autocomplete usually store value or ID.
            evento_id: ['', Validators.required],
            tipo_participante: ['convidado', Validators.required],
            observacoes: [''],
            gerar_url: [true]
        });
    }

    // Helper for autocomplete display
    casalControl = new FormControl<string | Casal>('');

    ngOnInit(): void {
        // Combine loading of dependencies
        this.loadDependencies();

        // Setup filter
        this.filteredCasais = this.casalControl.valueChanges.pipe(
            startWith(''),
            map(value => {
                const name = typeof value === 'string' ? value : this.displayCasal(value);
                return name ? this._filterCasais(name as string) : this.casais.slice();
            })
        );

        // Handle form sync
        this.casalControl.valueChanges.subscribe(val => {
            if (typeof val !== 'string' && val?.id) {
                this.form.get('casal_id')?.setValue(val.id);
            }
        });

        const id = this.route.snapshot.params['id'];
        if (id) {
            this.isEditMode = true;
            this.inscricaoId = +id;
            // We load inscricao after dependencies to set values correctly
        }
    }

    loadDependencies(): void {
        combineLatest([
            this.eventoService.getEventos(),
            this.casalService.getCasais()
        ]).subscribe({
            next: ([eventos, casais]) => {
                this.eventos = eventos;
                this.casais = casais;

                if (this.isEditMode && this.inscricaoId) {
                    this.loadInscricao(this.inscricaoId);
                }
            },
            error: (err) => console.error(err)
        });
    }

    private _filterCasais(name: string): Casal[] {
        const filterValue = name.toLowerCase();
        return this.casais.filter(casal => {
            const esposo = casal.esposo?.nome_social || casal.esposo?.nome_completo || '';
            const esposa = casal.esposa?.nome_social || casal.esposa?.nome_completo || '';
            return esposo.toLowerCase().includes(filterValue) || esposa.toLowerCase().includes(filterValue);
        });
    }

    displayCasal(casal: Casal | null): string {
        if (!casal) return '';
        const esposo = casal.esposo?.nome_social || casal.esposo?.nome_completo || '?';
        const esposa = casal.esposa?.nome_social || casal.esposa?.nome_completo || '?';
        return `${esposo} e ${esposa}`;
    }

    loadInscricao(id: number): void {
        this.isLoading = true;
        this.inscricaoService.getInscricao(id).subscribe({
            next: (inscricao) => {
                this.form.patchValue({
                    casal_id: inscricao.casal_id,
                    evento_id: inscricao.evento_id,
                    tipo_participante: inscricao.tipo_participante,
                    observacoes: inscricao.observacoes
                });

                // Set autocomplete
                const selectedCasal = this.casais.find(c => c.id === inscricao.casal_id);
                if (selectedCasal) {
                    this.casalControl.setValue(selectedCasal);
                }

                this.isLoading = false;
            },
            error: (err) => {
                console.error(err);
                this.isLoading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            // Also check casalControl
            if (!this.form.get('casal_id')?.value) {
                this.casalControl.setErrors({ 'required': true });
            }
            return;
        }

        const formValue = this.form.value;
        const request: CreateInscricaoRequest = {
            inscricao: {
                casal_id: formValue.casal_id,
                evento_id: formValue.evento_id,
                tipo_participante: formValue.tipo_participante,
                observacoes: formValue.observacoes
            },
            gerar_url: formValue.gerar_url
        };

        if (this.isEditMode && this.inscricaoId) {
            this.inscricaoService.updateInscricao(this.inscricaoId, request).subscribe({
                next: () => {
                    this.snackBar.open('Inscrição atualizada!', 'Fechar', { duration: 3000 });
                    this.router.navigate(['/inscricoes']);
                },
                error: (err) => console.error(err)
            });
        } else {
            this.inscricaoService.createInscricao(request).subscribe({
                next: () => {
                    this.snackBar.open('Inscrição realizada!', 'Fechar', { duration: 3000 });
                    this.router.navigate(['/inscricoes']);
                },
                error: (err) => console.error(err)
            });
        }
    }
}
