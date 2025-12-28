import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CotizacionResponse, DolarResponse } from '../models/dolar.interfaces';

@Injectable({
  providedIn: 'root',
})
export class DolarService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://dolarapi.com/v1';

  // Signals for state management
  dolares = signal<DolarResponse[]>([]);
  otrasCotizaciones = signal<CotizacionResponse[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  async fetchAll() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [dolares, cotizaciones] = await Promise.all([
        firstValueFrom(this.http.get<DolarResponse[]>(`${this.baseUrl}/dolares`)),
        firstValueFrom(this.http.get<CotizacionResponse[]>(`${this.baseUrl}/cotizaciones`)),
      ]);

      this.dolares.set(dolares);
      this.otrasCotizaciones.set(cotizaciones);
    } catch (err) {
      console.error('Error fetching data:', err);
      this.error.set('Error al cargar las cotizaciones. Intente nuevamente.');
    } finally {
      this.loading.set(false);
    }
  }
}
