import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UrlsUnicasService {

  authService = inject(AuthService);
  
  private apiUrl = '/api';

  
  constructor(private http: HttpClient) { }

  headers = new HttpHeaders() // Initialize headers here
    .set('Content-Type', 'application/json')
    .set('Authorization', `${this.authService.getToken()}`);


  gerarConvite(data: any) {
    return this.http.post(`${this.apiUrl}/urls-unicas/gerar-convite`, data, {headers: this.headers});
  }


}
