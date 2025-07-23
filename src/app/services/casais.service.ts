import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Registro } from '../models/registro.model';
import { AuthService } from './auth.service';
import { coerceStringArray } from '@angular/cdk/coercion';

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
  authService = inject(AuthService);

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${this.authService.getToken()}`
    });
  }

  getCasais(): Observable<any> {
    return this.http.get(`${this.apiUrl}/casais`, { headers: this.getHeaders() });
  }

  getCasaisById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/casais/${id}`, { headers: this.getHeaders() });
  }

  createCasal(casal: any): Observable<any> {
    console.log('Creating casal:', casal);
    return this.http.post(`${this.apiUrl}/casais`, casal, { headers: this.getHeaders() });
  }

  updateCasal(id: number, casal: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/casais/${id}`, casal, { headers: this.getHeaders() });
  }
}
