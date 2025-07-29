import { Component } from '@angular/core';
import { Pessoa, RegistroRecord } from '../../models/registro.model';

interface RegistroOnibus {
  nome: string;
  rg: string;
  orgao: string;
  cpf: string;
}

@Component({
  selector: 'app-relatorio-onibus',
  standalone: true,
  imports: [],
  templateUrl: './relatorio-onibus.html',
  styleUrl: './relatorio-onibus.scss'
})
export class RelatorioOnibus {


  static gerarRelatorio(convidados: any[]) {
    const novaRelacao: RegistroOnibus[] = [];
    convidados.forEach((casal: any) => {
      // A interface Pessoa é uma suposição, ajuste se o tipo for outro.
      if (casal.tipo_participante === "convidado") {
        const esposo = casal.casal.dados.pessoas.find((p: any) => p.tipo === 'esposo');
        const esposa = casal.casal.dados.pessoas.find((p: any) => p.tipo === 'esposa');

        if (esposo) {
          novaRelacao.push({
            nome: esposo.nome_completo ?? '',
            rg: esposo.rg ?? '',
            orgao: esposo.rg_emissor ?? '',
            cpf: esposo.cpf ?? '',
          });
        }

        if (esposa) {
          novaRelacao.push({
            nome: esposa.nome_completo ?? '',
            rg: esposa.rg ?? '',
            orgao: esposa.rg_emissor ?? '',
            cpf: esposa.cpf ?? '',
          });
        }
      }
    });
    novaRelacao.sort((a, b) => a.nome.localeCompare(b.nome));
    return novaRelacao;
  }

}
