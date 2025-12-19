import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Casal, CreateCasalRequest } from '../models/casal.model';

@Injectable({
    providedIn: 'root'
})
export class CasalService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/casais`;

    getCasais(): Observable<Casal[]> {
        return this.http.get<Casal[]>(this.apiUrl);
    }

    getCasal(id: number): Observable<Casal> {
        return this.http.get<Casal>(`${this.apiUrl}/${id}`);
    }

    createCasal(request: CreateCasalRequest): Observable<Casal> {
        return this.http.post<Casal>(this.apiUrl, request);
    }

    updateCasal(id: number, request: CreateCasalRequest): Observable<Casal> {
        return this.http.put<Casal>(`${this.apiUrl}/${id}`, request);
    }

    deleteCasal(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
