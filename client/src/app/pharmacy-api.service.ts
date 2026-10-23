import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Medicine, MedicineRequest, Sale, SaleRequest } from './models';

@Injectable({ providedIn: 'root' })
export class PharmacyApiService {
  constructor(private readonly http: HttpClient) {}

  getMedicines(search = ''): Observable<Medicine[]> {
    let params = new HttpParams();
    const term = search.trim();
    if (term) {
      params = params.set('search', term);
    }

    return this.http.get<Medicine[]>('/api/medicines', { params }).pipe(
      catchError(this.handleError));
  }

  addMedicine(payload: MedicineRequest): Observable<Medicine> {
    return this.http.post<Medicine>('/api/medicines', payload).pipe(
      catchError(this.handleError));
  }

  getSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>('/api/sales').pipe(
      catchError(this.handleError));
  }

  recordSale(payload: SaleRequest): Observable<Sale> {
    return this.http.post<Sale>('/api/sales', payload).pipe(
      catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    const body = error.error;
    if (typeof body === 'string' && body.trim()) {
      return throwError(() => new Error(body));
    }

    const payload = body as { message?: string; title?: string; errors?: Record<string, string[]> } | null;
    const validation = payload?.errors ? Object.values(payload.errors).flat()[0] : undefined;
    const message = payload?.message || validation || payload?.title || 'Request failed.';

    return throwError(() => new Error(message));
  }
}
