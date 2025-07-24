import { Component, Input, input } from '@angular/core';
import { CasaisService } from '../../services/casais.service';
import { InscricoesService } from '../../services/inscricoes.service';
import jsPDF from 'jspdf';

export interface Inscricao {
  id: number,
  casal_id: number,
  evento_id: number,
  status: string,
  data_inscricao: string,
  tipo_participante: string,
  nome: string,
  email: string
}


@Component({
  selector: 'app-lista-ecc-pdf',
  templateUrl: './lista-ecc-pdf.html',
  styleUrl: './lista-ecc-pdf.scss'
})
export class ListaEccPdf {

  constructor(
    private casaisService: CasaisService,
    private inscricoesService: InscricoesService
  ) { }

  @Input() inscricoes: Inscricao[] = [];

  // Initialize jsPDF
  doc = new jsPDF();



}


