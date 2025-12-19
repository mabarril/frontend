import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export class Utils {
    static formatarData(data: any) {
        if (!data) return '';
        const partes = data.split('-');
        if (partes.length !== 3) return data; // Retorna a data original      
        return `${partes[2]}/${partes[1]}/${partes[0]}`; // Formato DD/MM/AAAA
    }

    static formataCelular(celular: string) {
        if (!celular) return '';
        // Remove caracteres não numéricos
        celular = celular.replace(/\D/g, '');
        // Formata o celular
        if (celular.length === 11) {
            return `(${celular.slice(0, 2)}) ${celular.slice(2, 7)}-${celular.slice(7)}`;
        } else if (celular.length === 10) {
            return `(${celular.slice(0, 2)}) ${celular.slice(2, 6)}-${celular.slice(6)}`;
        }
        return celular; // Retorna o celular original se não tiver o tamanho esperado
    }


    static generatePdf(colunas: string[], dados: any[], titulo: string) {
        const doc = new jsPDF();

        // Prepare table headers
        const head = [colunas.map(col => col.toUpperCase())]; // Capitalize for headers

        // Prepare table body data
        let dadosOrdenados = dados.sort((a, b) => {
            if (a.nome < b.nome) return -1;
            if (a.nome > b.nome) return 1;
            return 0;
        })

        const body = dadosOrdenados.map(row => colunas.map(col => row[col]));

        doc.rect(14, 14, 180, 14); // empty square
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`ENCONTRO DE CASAIS COM CRISTO (ECC) - Brasília - DF`, 105, 20, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(`${titulo}`, 105, 27, { align: 'center' });

        autoTable(doc, {
            head: head,
            body: body,
            startY: 35, // Starting Y position for the table
            theme: 'striped', // Optional: 'striped', 'grid', 'plain'
            styles: {
                fontSize: 10,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [41, 128, 185], // Example header background color
                textColor: 255, // White text
                fontStyle: 'bold',
            },
        });

        doc.save(`${titulo}.pdf`);
    }
}

