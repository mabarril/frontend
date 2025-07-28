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

    let positionY = 50;

    doc.setFontSize(12);
    doc.text('Teste', 50, positionY);

    positionY += 10;

    for (const pais of filhos) {
      // doc.text(filhos.nome, 50, positionY +=10);
    }
    
    

    let pdfName = `Filhos`;
    doc.save('' + pdfName + '.pdf');
  }
}
