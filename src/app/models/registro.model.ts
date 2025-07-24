export interface Pessoa {
  tipo: 'esposo' | 'esposa';
  nome_completo: string;
  nome_social?: string;
  data_nascimento?: string;
  profissao?: string;
  email?: string;
  celular?: string;
  rg?: string;
  rg_emissor?: string;
  cpf?: string;
  problema_saude: boolean;
  problema_saude_descricao?: string;
  medicamento_especial: boolean;
  medicamento_especial_descricao?: string;
  diabetico: boolean;
  dieta_alimentar: 'não' | 'ovolactovegetariano' | 'vegetariano' | 'vegano';
  religiao: 'Adventista do 7º Dia' | 'Católica' | 'Evangélica' | 'Espírita' | 'Outras Denominações' | 'Cristão' | 'Sem Religião';
}

export interface Filho {
  nome_completo: string;
  data_nascimento?: string;
}

export interface Casal {
  data_casamento?: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  contato_emergencia_nome1?: string;
  contato_emergencia_telefone1?: string;
  contato_emergencia_nome2?: string;
  contato_emergencia_telefone2?: string;
  responsavel_filhos_nome?: string;
  responsavel_filhos_telefone?: string;
}

export interface RegistroRecord {
  casal: Casal;
  pessoas: Pessoa[];
  filhos: Filho[];
}

export interface Registro {
  data_casamento?: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  contato_emergencia_nome1?: string;
  contato_emergencia_telefone1?: string;
  contato_emergencia_nome2?: string;
  contato_emergencia_telefone2?: string;
  responsavel_filhos_nome?: string;
  responsavel_filhos_telefone?: string;
  pessoas: Pessoa[];
  filhos: Filho[];
}
