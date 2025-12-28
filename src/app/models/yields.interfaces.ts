export interface RendimientoItem {
  moneda: string;
  apy: number;
  fecha: string;
}

export interface EntidadRendimiento {
  entidad: string;
  rendimientos: RendimientoItem[];
}

export interface PlazoFijoItem {
  entidad: string;
  logo: string;
  tnaClientes: number | null;
  tnaNoClientes: number | null;
  enlace: string | null;
}

// Para Mercado Pago, Personal Pay, etc (FCI)
export interface FciItem {
  fondo: string;
  vcp: number;
  fecha: string;
  tna?: number; // Calculada o provista
}

// Para Naranja X, Ualá (Otros)
export interface OtroFondoItem {
  fondo: string;
  tna: number;
  tea: number;
  tope: number | null;
  fecha: string;
}
