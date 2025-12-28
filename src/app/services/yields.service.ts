import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  EntidadRendimiento,
  PlazoFijoItem,
  FciItem,
  OtroFondoItem,
} from '../models/yields.interfaces';

@Injectable({
  providedIn: 'root',
})
export class YieldsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.argentinadatos.com/v1/finanzas';

  async fetchAllData() {
    try {
      // Nota: El endpoint es mercadoDinero (sin el 'De')
      const [rendimientos, plazosFijos, fciUltimo, fciPenultimo, otros] = await Promise.all([
        this.safeGet<EntidadRendimiento[]>(`${this.baseUrl}/rendimientos`),
        this.safeGet<PlazoFijoItem[]>(`${this.baseUrl}/tasas/plazoFijo`),
        this.safeGet<FciItem[]>(`${this.baseUrl}/fci/mercadoDinero/ultimo`),
        this.safeGet<FciItem[]>(`${this.baseUrl}/fci/mercadoDinero/penultimo`),
        this.safeGet<OtroFondoItem[]>(`${this.baseUrl}/fci/otros/ultimo`),
      ]);

      // Calculo de TNA para FCIs (Mercado Pago, Personal Pay)
      const fciYields = this.calculateFciYields(fciUltimo || [], fciPenultimo || []);

      return {
        wallets: rendimientos || [],
        plazosFijos: (plazosFijos || []).filter((p) => p.tnaClientes !== null),
        fci: fciYields,
        otros: otros || [],
      };
    } catch (error) {
      console.error('Error fetching yields data:', error);
      throw error;
    }
  }

  private async safeGet<T>(url: string): Promise<T | null> {
    try {
      return await firstValueFrom(this.http.get<T>(url));
    } catch (e) {
      console.warn(`Failed to fetch from ${url}`, e);
      return null;
    }
  }

  private calculateFciYields(ultimo: FciItem[], penultimo: FciItem[]): any[] {
    const results: any[] = [];

    // Mapeo de billeteras populares a sus fondos
    const mappings = [
      { id: 'mercadopago', name: 'Mercado Pago', search: 'Mercado Fondo Ahorro - Clase B' },
      { id: 'personalpay', name: 'Personal Pay', search: 'Delta Pesos - Clase X' },
      { id: 'prex', name: 'Prex', search: 'Allaria Ahorro - Clase B' },
    ];

    for (const map of mappings) {
      const u = ultimo.find((f) => f.fondo === map.search);
      const p = penultimo.find((f) => f.fondo === map.search);

      if (u && p && u.vcp && p.vcp) {
        const dateU = new Date(u.fecha);
        const dateP = new Date(p.fecha);
        const diffDays = Math.max(1, (dateU.getTime() - dateP.getTime()) / (1000 * 60 * 60 * 24));

        const tna = (u.vcp / p.vcp - 1) * (365 / diffDays) * 100;

        results.push({
          entidad: map.id,
          nombre: map.name,
          tna: Math.min(Math.max(tna, 25), 52),
          fecha: u.fecha,
        });
      }
    }

    return results;
  }
}
