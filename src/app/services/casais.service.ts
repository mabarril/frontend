import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Registro } from '../models/registro.model';

interface Casal {
  id: number;
  data_casamento: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  contato_emergencia_nome1: string;
  contato_emergencia_telefone1: string;
  contato_emergencia_nome2: string;
  contato_emergencia_telefone2: string;
  responsavel_filhos_nome: string;
  responsavel_filhos_telefone: string;
  deleted_at: string
}

@Injectable({
  providedIn: 'root'
})

export class CasaisService {

  private apiUrl = '/api';
  constructor(private http: HttpClient) { }

  getCasais(casais: Casal[] = []) {
    return this.http.get(`${this.apiUrl}/casais`);
  }
  getCasaisById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/casais/${id}`);
  }
  createCasal(casal: any) {
    return this.http.post(`${this.apiUrl}/casais`, casal);
  }

}
