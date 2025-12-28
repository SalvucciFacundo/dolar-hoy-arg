import {
  Component,
  computed,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { YieldsService } from '../../services/yields.service';
import { EntidadRendimiento } from '../../models/yields.interfaces';

interface UnifiedYield {
  id: string;
  nombre: string;
  apy: number;
  moneda: string;
  fecha: string;
  logo?: string;
  tags: string[];
}

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  templateUrl: './wallets.component.html',
  styleUrl: './wallets.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block p-4',
  },
})
export class WalletsComponent implements OnInit {
  private readonly yieldsService = inject(YieldsService);

  // Estados
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly rawData = signal<any>(null);

  // Logos manuales
  private readonly walletLogos: Record<string, string> = {
    mercadopago: 'https://logospng.org/wp-content/uploads/mercado-pago.png',
    naranjax: 'https://ayuda.naranjax.com/hc/theming_assets/01HZP8QY8S7XBC2Z9XAVT7RWSF',
    personalpay: 'https://www.personalpay.com.ar/favicon.png',
    uala: 'https://icons.com.ar/icons/bancos-apps/uala.svg',
    lemoncash: 'https://lemon.me/favicon.png',
    buenbit: 'https://buenbit.com/favicon.png',
    fiwind: 'https://fiwind.io/favicon.png',
    belo: 'https://belo.app/favicon.png',
    letsbit: 'https://letsbit.io/favicon.png',
    prex: 'https://www.prexcard.com.ar/favicon.ico',
  };

  protected readonly processedYields = computed(() => {
    const data = this.rawData();
    if (!data) return [];

    const unified: UnifiedYield[] = [];

    // 1. Naranja X y Ualá
    if (data.otros) {
      data.otros.forEach((item: any) => {
        if (item.fondo === 'NARANJA X' || item.fondo === 'UALA') {
          const id = item.fondo.toLowerCase().replace(/\s+/g, '');
          unified.push({
            id,
            nombre: item.fondo === 'NARANJA X' ? 'Naranja X' : 'Ualá (Cuenta)',
            apy: item.tna * 100,
            moneda: 'ARS',
            fecha: item.fecha,
            logo: this.walletLogos[id],
            tags: ['Billetera', 'Tasa Fija'],
          });
        }
      });
    }

    // 2. Mercado Pago, Personal Pay, Prex (FCI)
    if (data.fci) {
      data.fci.forEach((item: any) => {
        unified.push({
          id: item.entidad,
          nombre: item.nombre,
          apy: item.tna,
          moneda: 'ARS',
          fecha: item.fecha,
          logo: this.walletLogos[item.entidad],
          tags: ['Billetera', 'FCI'],
        });
      });
    }

    // 3. Otros de ArgentinaDatos
    if (data.wallets) {
      data.wallets.forEach((entidad: EntidadRendimiento) => {
        const arsRend = entidad.rendimientos.find((r) => r.moneda === 'ARS');
        if (arsRend) {
          if (!unified.find((u) => u.id === entidad.entidad)) {
            unified.push({
              id: entidad.entidad,
              nombre: entidad.entidad.charAt(0).toUpperCase() + entidad.entidad.slice(1),
              apy: arsRend.apy,
              moneda: 'ARS',
              fecha: arsRend.fecha,
              logo: this.walletLogos[entidad.entidad.toLowerCase()],
              tags: ['Cripto', 'Billetera'],
            });
          }
        }
      });
    }

    return unified.sort((a, b) => b.apy - a.apy);
  });

  protected readonly filteredPlazosFijos = computed(() => {
    const data = this.rawData();
    if (!data || !data.plazosFijos) return [];
    return data.plazosFijos
      .sort((a: any, b: any) => (b.tnaClientes || 0) - (a.tnaClientes || 0))
      .slice(0, 10);
  });

  async ngOnInit() {
    await this.refresh();
  }

  async refresh() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.yieldsService.fetchAllData();
      this.rawData.set(data);
    } catch (err) {
      this.error.set('Error al cargar datos financieros.');
    } finally {
      this.loading.set(false);
    }
  }

  protected getLogo(entidad: string): string {
    return (
      this.walletLogos[entidad.toLowerCase()] ||
      `https://ui-avatars.com/api/?name=${entidad}&background=random&color=fff`
    );
  }
}
