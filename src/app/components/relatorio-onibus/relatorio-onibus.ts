import { Component, OnInit } from '@angular/core';
import { InscricoesService } from '../../services/inscricoes.service';
import { CasaisService } from '../../services/casais.service';
import { Casal, RegistroRecord } from '../../models/registro.model';
import { EMPTY_SUBSCRIPTION } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-relatorio-onibus',
  imports: [],
  templateUrl: './relatorio-onibus.html',
  styleUrl: './relatorio-onibus.scss'
})

interface registroOnibus {
  nome: string;
  rg: string;
  cpf: string;
  org: string;
}

export class RelatorioOnibus {
  
    constructor(
    private inscricaoService: InscricoesService,
    private casaisService: CasaisService
   ) { }

  gerarRelatorio(convidados : RegistroRecord[]) {
    convidados.map((casal : RegistroRecord) => {
      const esposo = casal.pessoas.find((p: any) => p.tipo === 'esposo');
      const esposa = casal.pessoas.find((p: any) => p.tipo === 'esposa');

      const regEsposo = {
        nome: esposo?.nome_completo,
        rg: esposo?.rg,
        orgao: esposo?.rg_emissor,
        cpf: esposo?.cpf
      }

      const regEsposa = {
        
      }

    } );
  }

}
