import { Component } from '@angular/core';
import { jsPDF } from 'jspdf';
@Component({
  selector: 'app-lista-filhos',
  imports: [],
  templateUrl: './lista-filhos.html',
  styleUrl: './lista-filhos.scss'
})
export class ListaFilhos {

 
  static gerarPDF(filhos: any[]) {
    const doc = new jsPDF();

    console.log('Gerando PDF com os filhos:', filhos);



    if (!filhos) return;
    doc.rect(15, 15, 180, 15); // empty square
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`ENCONTRO DE CASAIS COM CRISTO (ECC) - 01 a 03/AGO/25`, 105, 20, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Relação de Filhos`, 105, 27, { align: 'center' });

    let yPosition = 40;
    yPosition += 5;
    doc.setFont('helvetica', 'normal');

    let pdfName = `Filhos`;
    doc.save('' + pdfName + '.pdf');
  }
}
