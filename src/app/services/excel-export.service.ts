import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  formatter?: (value: any) => string;
}

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeTimestamp?: boolean;
  customHeaders?: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  /**
   * Exporta dados para um arquivo Excel
   * @param data Array de dados para exportar
   * @param columns Configuração das colunas
   * @param options Opções de exportação
   */
  exportToExcel<T>(
    data: T[], 
    columns: ExportColumn[], 
    options: ExportOptions = {}
  ): void {
    try {
      if (!data || data.length === 0) {
        throw new Error('Nenhum dado disponível para exportação');
      }

      if (!columns || columns.length === 0) {
        throw new Error('Configuração de colunas é obrigatória');
      }

      const processedData = this.processData(data, columns);
      const worksheet = this.createWorksheet(processedData, columns);
      const workbook = this.createWorkbook(worksheet, options.sheetName || 'Dados');
      
      this.saveFile(workbook, this.generateFilename(options));
      
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      throw error;
    }
  }

  /**
   * Processa os dados aplicando formatadores e extraindo valores aninhados
   */
  private processData<T>(data: T[], columns: ExportColumn[]): any[] {
    return data.map(item => {
      const processedItem: any = {};
      
      columns.forEach(column => {
        let value = this.getNestedValue(item, column.key);
        
        if (column.formatter && value !== null && value !== undefined) {
          value = column.formatter(value);
        }
        
        processedItem[column.header] = value || '';
      });
      
      return processedItem;
    });
  }

  /**
   * Extrai valores de propriedades aninhadas usando notação de ponto
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Cria a planilha com formatação
   */
  private createWorksheet(data: any[], columns: ExportColumn[]): XLSX.WorkSheet {
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Aplica larguras das colunas
    const columnWidths = columns.map(col => ({ 
      wch: col.width || this.calculateColumnWidth(col.header) 
    }));
    worksheet['!cols'] = columnWidths;
    
    // Aplica formatação aos cabeçalhos
    this.formatHeaders(worksheet, columns);
    
    return worksheet;
  }

  /**
   * Calcula largura automática da coluna baseada no cabeçalho
   */
  private calculateColumnWidth(header: string): number {
    const baseWidth = Math.max(header.length, 10);
    return Math.min(baseWidth + 5, 50);
  }

  /**
   * Aplica formatação aos cabeçalhos
   */
  private formatHeaders(worksheet: XLSX.WorkSheet, columns: ExportColumn[]): void {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      const cell = worksheet[cellAddress];
      
      if (cell) {
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "366092" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
    }
  }

  /**
   * Cria o workbook
   */
  private createWorkbook(worksheet: XLSX.WorkSheet, sheetName: string): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    return workbook;
  }

  /**
   * Gera nome do arquivo
   */
  private generateFilename(options: ExportOptions): string {
    const baseFilename = options.filename || 'exportacao';
    const timestamp = options.includeTimestamp !== false 
      ? `_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}`
      : '';
    
    return `${baseFilename}${timestamp}.xlsx`;
  }

  /**
   * Salva o arquivo
   */
  private saveFile(workbook: XLSX.WorkBook, filename: string): void {
    XLSX.writeFile(workbook, filename);
  }

  /**
   * Exporta especificamente a lista de inscritos
   */
  exportListaInscritos(listaInscritos: any[], nomeEvento?: string): void {
    const columns: ExportColumn[] = [
      { 
        key: 'id', 
        header: 'ID', 
        width: 8 
      },
      { 
        key: 'casal.nome', 
        header: 'Nome do Casal', 
        width: 35 
      },
      { 
        key: 'quarto', 
        header: 'Quarto', 
        width: 35 
      },
      { 
        key: 'tipo_participante', 
        header: 'Tipo de Participante', 
        width: 20,
        formatter: (value) => this.formatTipoParticipante(value)
      },
      { 
        key: 'status', 
        header: 'Status', 
        width: 15,
        formatter: (value) => this.formatStatus(value)
      },
      { 
        key: 'data_inscricao', 
        header: 'Data de Inscrição', 
        width: 18,
        formatter: (value) => this.formatDate(value)
      },
      { 
        key: 'casal.dados.pessoas', 
        header: 'Esposo', 
        width: 25,
        formatter: (pessoas) => this.extractEsposo(pessoas)
      },
      { 
        key: 'casal.dados.pessoas', 
        header: 'Esposa', 
        width: 25,
        formatter: (pessoas) => this.extractEsposa(pessoas)
      },
      { 
        key: 'casal.dados.pessoas', 
        header: 'Telefone Contato', 
        width: 18,
        formatter: (pessoas) => this.extractTelefone(pessoas)
      },
      { 
        key: 'casal.dados.pessoas', 
        header: 'Email Contato', 
        width: 30,
        formatter: (pessoas) => this.extractEmail(pessoas)
      }
    ];

    const options: ExportOptions = {
      filename: nomeEvento ? `lista_inscritos_${nomeEvento.replace(/\s+/g, '_')}` : 'lista_inscritos',
      sheetName: 'Lista de Inscritos',
      includeTimestamp: true
    };
    console.log('li ', listaInscritos)
    this.exportToExcel(listaInscritos, columns, options);
  }

  /**
   * Formatadores específicos
   */
  private formatTipoParticipante(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'encontrista': 'Encontrista',
      'convidado': 'Convidado',
      'equipe': 'Equipe'
    };
    return tipos[tipo] || tipo;
  }

  private formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'confirmada': 'Confirmada',
      'pendente': 'Pendente',
      'cancelada': 'Cancelada'
    };
    return statusMap[status] || status;
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  }

  private extractEsposo(pessoas: any[]): string {
    if (!Array.isArray(pessoas)) return '';
    const esposo = pessoas.find(p => p.tipo === 'esposo');
    return esposo?.nome_social || '';
  }

  private extractEsposa(pessoas: any[]): string {
    if (!Array.isArray(pessoas)) return '';
    const esposa = pessoas.find(p => p.tipo === 'esposa');
    return esposa?.nome_social || '';
  }

  private extractTelefone(pessoas: any[]): string {
    if (!Array.isArray(pessoas)) return '';
    // Prioriza telefone do esposo, depois da esposa
    const esposo = pessoas.find(p => p.tipo === 'esposo');
    const esposa = pessoas.find(p => p.tipo === 'esposa');
    
    return esposo?.telefone || esposa?.telefone || '';
  }

  private extractEmail(pessoas: any[]): string {
    if (!Array.isArray(pessoas)) return '';
    // Prioriza email do esposo, depois da esposa
    const esposo = pessoas.find(p => p.tipo === 'esposo');
    const esposa = pessoas.find(p => p.tipo === 'esposa');
    
    return esposo?.email || esposa?.email || '';
  }

  /**
   * Exporta lista de dietas alimentares
   */
  exportListaDietas(listaInscritos: any[]): void {
    const dietasData: any[] = [];
    
    listaInscritos.forEach(participante => {
      if (participante.casal?.dados?.pessoas) {
        participante.casal.dados.pessoas.forEach((pessoa: any) => {
          if (pessoa.dieta_alimentar && pessoa.dieta_alimentar !== "não") {
            const nome = pessoa.tipo === 'esposo' 
              ? participante.casal.nome_esposo 
              : participante.casal.nome_esposa;
            
            dietasData.push({
              nome: nome,
              dieta: pessoa.dieta_alimentar,
              tipo: participante.tipo_participante,
              telefone: pessoa.telefone || '',
              observacoes: pessoa.observacoes_dieta || ''
            });
          }
        });
      }
    });

    const columns: ExportColumn[] = [
      { key: 'nome', header: 'Nome', width: 30 },
      { key: 'dieta', header: 'Dieta Alimentar', width: 25 },
      { key: 'tipo', header: 'Tipo Participante', width: 20 },
      { key: 'telefone', header: 'Telefone', width: 18 },
      { key: 'observacoes', header: 'Observações', width: 40 }
    ];

    const options: ExportOptions = {
      filename: 'lista_dietas_alimentares',
      sheetName: 'Dietas Alimentares',
      includeTimestamp: true
    };

    this.exportToExcel(dietasData, columns, options);
  }

  /**
   * Exporta lista de diabéticos
   */
  exportListaDiabeticos(listaInscritos: any[]): void {
    const diabeticosData: any[] = [];
    
    listaInscritos.forEach(participante => {
      if (participante.casal?.dados?.pessoas) {
        participante.casal.dados.pessoas.forEach((pessoa: any) => {
          if (pessoa.diabetico === true) {
            const nome = pessoa.tipo === 'esposo' 
              ? participante.casal.nome_esposo 
              : participante.casal.nome_esposa;
            
            diabeticosData.push({
              nome: nome,
              diabetico: "SIM",
              tipo: participante.tipo_participante,
              telefone: pessoa.telefone || '',
              medicamentos: pessoa.medicamentos_diabetes || ''
            });
          }
        });
      }
    });

    const columns: ExportColumn[] = [
      { key: 'nome', header: 'Nome', width: 30 },
      { key: 'diabetico', header: 'Diabético', width: 15 },
      { key: 'tipo', header: 'Tipo Participante', width: 20 },
      { key: 'telefone', header: 'Telefone', width: 18 },
      { key: 'medicamentos', header: 'Medicamentos', width: 40 }
    ];

    const options: ExportOptions = {
      filename: 'lista_diabeticos',
      sheetName: 'Lista Diabéticos',
      includeTimestamp: true
    };

    this.exportToExcel(diabeticosData, columns, options);
  }

  /**
   * Exporta lista de afilhados
   */
  exportListaAfilhados(listaInscritos: any[], casaisMap: Map<number, any>): void {
    const afilhadosData = listaInscritos
      .filter(inscricao => inscricao.tipo_participante === 'convidado')
      .map(participante => ({
        convidado: participante.casal.nome,
        padrinho: participante.padrinho_id 
          ? casaisMap.get(participante.padrinho_id)?.nome || 'Não encontrado'
          : 'Não definido',
        telefone_convidado: this.extractTelefone(participante.casal?.dados?.pessoas || []),
        email_convidado: this.extractEmail(participante.casal?.dados?.pessoas || [])
      }));

    const columns: ExportColumn[] = [
      { key: 'convidado', header: 'Convidado', width: 35 },
      { key: 'padrinho', header: 'Padrinho', width: 35 },
      { key: 'telefone_convidado', header: 'Telefone Convidado', width: 20 },
      { key: 'email_convidado', header: 'Email Convidado', width: 30 }
    ];

    const options: ExportOptions = {
      filename: 'lista_afilhados',
      sheetName: 'Lista Afilhados',
      includeTimestamp: true
    };

    this.exportToExcel(afilhadosData, columns, options);
  }
}

