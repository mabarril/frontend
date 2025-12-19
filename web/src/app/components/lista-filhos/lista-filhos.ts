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
    filhos.sort((a, b) => a.nome.localeCompare(b.nome));
    positionY += 10;
    console.log(filhos);

    for (const item of filhos) {
      doc.text(item.nome, 20, positionY += 5);
    }

    
    

    let pdfName = `Filhos`;
    doc.save('' + pdfName + '.pdf');
  }
}
