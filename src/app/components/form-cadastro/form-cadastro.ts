import { Component } from '@angular/core';
import { inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InscricoesService } from '../../services/inscricoes.service';
import { Registro } from '../../models/registro.model';
import { CasaisService } from '../../services/casais.service';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { Utils } from '../../services/utils';


const RELIGIOES = [
  'Adventista do 7º Dia',
  'evangélica',
  'espírita',
  'católica',
  'Outras Denominações',
  'Cristão',
  'outra',
  'sem religião'
];

const DIETAS_ALIMENTARES = [
  'não',
  'ovolactovegetariano',
  'vegetariano',
  'vegano'
];

@Component({
  selector: 'app-form-cadastro',
  imports: [NgxMaskDirective,
    NgxMaskPipe, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './form-cadastro.html',
  styleUrl: './form-cadastro.scss'
})
export class FormCadastro implements OnInit {

  inscricaoForm!: FormGroup;
  token!: string;
  loading = false;
  submitted = false;
  success = false;
  casal_id!: number;

  religioes = RELIGIOES;
  dietasAlimentares = DIETAS_ALIMENTARES;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private inscricoesService: InscricoesService,
    private snackBar: MatSnackBar,
    private casaisService: CasaisService
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.casal_id = +id;
        this.carregarDadosCasal(this.casal_id);
      }
    });
  }

  inicializarFormulario(): void {
    this.inscricaoForm = this.fb.group({
      casal: this.fb.group({
        data_casamento: [''],
        endereco: ['', Validators.required],
        bairro: ['', Validators.required],
        cidade: ['', Validators.required],
        cep: ['', Validators.required],
        contato_emergencia_nome1: [''],
        contato_emergencia_telefone1: [''],
        contato_emergencia_nome2: [''],
        contato_emergencia_telefone2: [''],
        responsavel_filhos_nome: [''],
        responsavel_filhos_telefone: ['']
      }),
      pessoas: this.fb.array([
        this.criarPessoaFormGroup('esposo'),
        this.criarPessoaFormGroup('esposa')
      ]),
      filhos: this.fb.array([])
    });
  }

  criarPessoaFormGroup(tipo: 'esposo' | 'esposa'): FormGroup {
    return this.fb.group({
      tipo: [tipo],
      nome_completo: ['', Validators.required],
      nome_social: [''],
      data_nascimento: [''],
      profissao: [''],
      email: ['', Validators.email],
      celular: [''],
      rg: [''],
      rg_emissor: [''],
      cpf: [''],
      problema_saude: [false],
      problema_saude_descricao: [''],
      medicamento_especial: [false],
      medicamento_especial_descricao: [''],
      diabetico: [false],
      dieta_alimentar: ['não'],
      religiao: ['católica', Validators.required]
    });
  }

  criarFilhoFormGroup(): FormGroup {
    return this.fb.group({
      nome_completo: ['', Validators.required],
      data_nascimento: ['']
    });
  }
  get pessoasFormArray(): FormArray {
    return this.inscricaoForm.get('pessoas') as FormArray;
  }

  get filhosFormArray(): FormArray {
    return this.inscricaoForm.get('filhos') as FormArray;
  }

  adicionarFilho(): void {
    this.filhosFormArray.push(this.criarFilhoFormGroup());
  }

  removerFilho(index: number): void {
    this.filhosFormArray.removeAt(index);
  }

  onSubmit(): void {
    this.submitted = true;

    // Verificar se o formulário é válido
    if (this.inscricaoForm.invalid) {
      this.mostrarSnackBar('Por favor, corrija os erros no formulário antes de enviar.', 'error');
      return;
    }

    this.loading = true;

    // Preparar dados para envio
    const registro: Registro = {
      ...this.inscricaoForm.value,
      token: this.token
    };

    // Enviar inscrição
    this.inscricoesService.atualizarInscricao(this.casal_id, registro).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.mostrarSnackBar('Inscrição registrada com sucesso!', 'success');
      },
      error: () => {
        this.loading = false;
        this.mostrarSnackBar('Erro ao enviar inscrição. Por favor, tente novamente.', 'error');
      }
    });
  }

  carregarDadosCasal(id: number): void {
    this.loading = true;
    this.casaisService.getCasaisById(id).subscribe({
      next: (registro: Registro) => {
        console.log('Dados do casal carregados:', registro);
        this.loading = false;
        if (registro) {
          this.inscricaoForm.patchValue({
            casal: registro.casal,
          });
          console.log('casal', registro.casal),
          // Se precisar ajustar arrays de pessoas/filhos:
          this.atualizarArraysDinamicos(registro);
        }
      },
      error: () => {
        this.loading = false;
        this.mostrarSnackBar('Erro ao carregar dados do casal.', 'error');
      }
    });
  }

  private atualizarArraysDinamicos(registro: Registro) {
    // Atualiza pessoas
    const pessoasArray = this.inscricaoForm.get('pessoas') as FormArray;
    pessoasArray.clear();
    if (Array.isArray(registro.pessoas)) {
      registro.pessoas.forEach(pessoa => {
        pessoasArray.push(this.fb.group(pessoa));
      });
    }

    // Atualiza filhos
    const filhosArray = this.inscricaoForm.get('filhos') as FormArray;
    filhosArray.clear();
    if (Array.isArray(registro.filhos)) {
      registro.filhos.forEach(filho => {
        filhosArray.push(this.fb.group(filho));
      });
    }
  }

  private mostrarSnackBar(mensagem: string, tipo: 'success' | 'error') {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 5000,
      panelClass: [`${tipo}-snackbar`]
    });
  }
}
