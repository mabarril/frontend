import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

import { CasalService } from '../../../core/services/casal.service';
import { CreateCasalRequest, Casal } from '../../../core/models/casal.model';

@Component({
    selector: 'app-casal-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatTabsModule,
        MatInputModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatCheckboxModule,
        MatIconModule,
        MatCardModule
    ],
    templateUrl: './casal-form.component.html',
    styles: [`
    .container { padding: 20px; max-width: 900px; margin: 0 auto; }
    .form-section { margin-top: 20px; }
    .row { display: flex; gap: 16px; flex-wrap: wrap; }
    .col { flex: 1; min-width: 200px; }
    .full-width { width: 100%; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
    .child-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  `]
})
export class CasalFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    casalId?: number;
    isLoading = false;

    private fb = inject(FormBuilder);
    private casalService = inject(CasalService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);

    constructor() {
        this.form = this.fb.group({
            casal: this.fb.group({
                data_casamento: ['', Validators.required],
                endereco: ['', Validators.required],
                bairro: [''],
                cidade: [''],
                cep: [''],
                contato_emergencia_nome1: [''],
                contato_emergencia_telefone1: [''],
                contato_emergencia_nome2: [''],
                contato_emergencia_telefone2: [''],
                responsavel_filhos_nome: [''],
                responsavel_filhos_telefone: ['']
            }),
            esposo: this.createPessoaForm('esposo'),
            esposa: this.createPessoaForm('esposa'),
            filhos: this.fb.array([])
        });
    }

    get filhosArray() {
        return this.form.get('filhos') as FormArray;
    }

    ngOnInit(): void {
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.isEditMode = true;
            this.casalId = +id;
            this.loadCasal(this.casalId);
        }
    }

    createPessoaForm(tipo: 'esposo' | 'esposa'): FormGroup {
        return this.fb.group({
            id: [null],
            tipo: [tipo],
            nome_completo: ['', Validators.required],
            nome_social: [''],
            data_nascimento: ['', Validators.required],
            profissao: [''],
            email: ['', [Validators.email]],
            celular: ['', Validators.required],
            rg: [''],
            rg_emissor: [''],
            cpf: [''],
            religiao: ['católica'],
            dieta_alimentar: ['não'],
            problema_saude: [false],
            problema_saude_descricao: [''],
            medicamento_especial: [false],
            medicamento_especial_descricao: [''],
            diabetico: [false]
        });
    }

    addFilho(): void {
        const filhoGroup = this.fb.group({
            id: [null],
            nome_completo: ['', Validators.required],
            data_nascimento: ['', Validators.required]
        });
        this.filhosArray.push(filhoGroup);
    }

    removeFilho(index: number): void {
        this.filhosArray.removeAt(index);
    }

    loadCasal(id: number): void {
        this.isLoading = true;
        this.casalService.getCasal(id).subscribe({
            next: (casal) => {
                this.patchForm(casal);
                this.isLoading = false;
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open('Erro ao carregar casal', 'Fechar', { duration: 3000 });
                this.isLoading = false;
            }
        });
    }

    patchForm(casal: Casal): void {
        // Patch casal details
        this.form.get('casal')?.patchValue(casal);

        // Patch Esposo
        if (casal.esposo) {
            this.form.get('esposo')?.patchValue(casal.esposo);
        } else if (casal.pessoas) {
            const esposo = casal.pessoas.find(p => p.tipo === 'esposo');
            if (esposo) this.form.get('esposo')?.patchValue(esposo);
        }

        // Patch Esposa
        if (casal.esposa) {
            this.form.get('esposa')?.patchValue(casal.esposa);
        } else if (casal.pessoas) {
            const esposa = casal.pessoas.find(p => p.tipo === 'esposa');
            if (esposa) this.form.get('esposa')?.patchValue(esposa);
        }

        // Patch Filhos
        if (casal.filhos) {
            this.filhosArray.clear();
            casal.filhos.forEach(filho => {
                const group = this.fb.group({
                    id: [filho.id],
                    nome_completo: [filho.nome_completo, Validators.required],
                    data_nascimento: [filho.data_nascimento, Validators.required]
                });
                this.filhosArray.push(group);
            });
        }
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.snackBar.open('Preencha os campos obrigatórios', 'Fechar', { duration: 3000 });
            return;
        }

        const formValue = this.form.value;

        // Prepare Request Object
        const request: CreateCasalRequest = {
            casal: formValue.casal,
            pessoas: [
                { ...formValue.esposo, tipo: 'esposo' },
                { ...formValue.esposa, tipo: 'esposa' }
            ],
            filhos: formValue.filhos
        };

        if (this.isEditMode && this.casalId) {
            this.casalService.updateCasal(this.casalId, request).subscribe({
                next: () => {
                    this.snackBar.open('Casal atualizado com sucesso!', 'Fechar', { duration: 3000 });
                    this.router.navigate(['/casais']);
                },
                error: (err) => {
                    // Error handled globally but we can handle specific UI logic here
                    console.error(err);
                }
            });
        } else {
            this.casalService.createCasal(request).subscribe({
                next: () => {
                    this.snackBar.open('Casal criado com sucesso!', 'Fechar', { duration: 3000 });
                    this.router.navigate(['/casais']);
                },
                error: (err) => console.error(err)
            });
        }
    }
}
