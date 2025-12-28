import { Component, inject, OnInit, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { DolarService } from '../../services/dolar.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <div class="dashboard-container">
      <header class="header">
        <div class="title-group">
          <h1>Dólar Hoy <span class="badge">Argentina</span></h1>
          <p class="subtitle">Cotizaciones en tiempo real</p>
        </div>
        @if (dolarService.loading()) {
        <div class="loader">Actualizando...</div>
        } @else {
        <button (click)="refresh()" class="refresh-btn">
          <span class="icon">↻</span> Actualizar
        </button>
        }
      </header>

      @if (dolarService.error()) {
      <div class="error-card glass-card">
        <p>{{ dolarService.error() }}</p>
        <button (click)="refresh()">Reintentar</button>
      </div>
      }

      <div class="grid">
        @for (item of dolarService.dolares(); track item.casa) {
        <div class="card glass-card">
          <div class="card-header">
            <h3>{{ item.nombre }}</h3>
            <div class="dot" [class.active]="true"></div>
          </div>

          <div class="prices">
            <div class="price-box">
              <span class="label">Compra</span>
              <span class="value">{{ item.compra | number : '1.2-2' }}</span>
            </div>
            <div class="price-box">
              <span class="label">Venta</span>
              <span class="value highlight">{{ item.venta | number : '1.2-2' }}</span>
            </div>
          </div>

          <div class="card-footer">
            <span class="date">Actualizado: {{ formatDate(item.fechaActualizacion) }}</span>
          </div>
        </div>
        }
      </div>

      <section class="secondary-rates">
        <h2>Otras Monedas</h2>
        <div class="horizontal-scroll">
          @for (item of filteredOtherRates(); track item.casa) {
          <div class="mini-card glass-card">
            <div class="mini-header">
              <strong>{{ item.nombre }}</strong>
              <span class="currency-code">{{ item.moneda }}</span>
            </div>
            <div class="mini-prices">
              <span
                >Venta: <strong>{{ item.venta | number : '1.2-2' }}</strong></span
              >
            </div>
          </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: `
    .dashboard-container
      padding: 2rem
      max-width: 1200px
      margin: 0 auto

    .header
      display: flex
      justify-content: space-between
      align-items: center
      margin-bottom: 3rem
      
      .title-group
        h1
          font-size: 2.5rem
          font-weight: 700
          display: flex
          align-items: center
          gap: 1rem
          
          .badge
            font-size: 0.8rem
            background: var(--primary)
            padding: 0.2rem 0.6rem
            border-radius: 2rem
            font-weight: 500
            
        .subtitle
          color: var(--text-muted)
          margin-top: 0.5rem

    .refresh-btn
      background: var(--glass)
      border: 1px solid var(--border)
      color: var(--text-main)
      padding: 0.75rem 1.5rem
      border-radius: 1rem
      cursor: pointer
      transition: all 0.3s ease
      display: flex
      align-items: center
      gap: 0.5rem
      font-weight: 500
      
      &:hover
        background: var(--border)
        transform: translateY(-2px)
        border-color: var(--primary)

    .grid
      display: grid
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))
      gap: 2rem
      margin-bottom: 4rem

    .card
      padding: 1.5rem
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
      position: relative
      overflow: hidden
      
      &:hover
        transform: translateY(-8px)
        border-color: var(--primary)
        box-shadow: 0 20px 40px -20px var(--primary-glow)
        
        &::after
          opacity: 1

      &::after
        content: ''
        position: absolute
        top: 0
        left: 0
        right: 0
        bottom: 0
        background: radial-gradient(circle at top right, rgba(79, 70, 229, 0.1), transparent)
        opacity: 0
        pointer-events: none
        transition: opacity 0.3s

    .card-header
      display: flex
      justify-content: space-between
      align-items: center
      margin-bottom: 1.5rem
      
      h3
        font-size: 1.25rem
        font-weight: 600
        
      .dot
        width: 8px
        height: 8px
        border-radius: 50%
        background: var(--text-muted)
        
        &.active
          background: var(--success)
          box-shadow: 0 0 10px var(--success)

    .prices
      display: flex
      gap: 1.5rem
      margin-bottom: 1.5rem
      
      .price-box
        flex: 1
        display: flex
        flex-direction: column
        
        .label
          font-size: 0.75rem
          color: var(--text-muted)
          text-transform: uppercase
          letter-spacing: 0.05em
          margin-bottom: 0.25rem
          
        .value
          font-size: 1.75rem
          font-weight: 700
          
          &.highlight
            color: var(--primary)

    .card-footer
      padding-top: 1rem
      border-top: 1px solid var(--border)
      
      .date
        font-size: 0.7rem
        color: var(--text-muted)

    .secondary-rates
      margin-top: 4rem
      
      h2
        margin-bottom: 2rem
        font-size: 1.5rem
        
    .horizontal-scroll
      display: flex
      gap: 1.5rem
      overflow-x: auto
      padding-bottom: 1rem
      
      &::-webkit-scrollbar
        height: 6px
      
    .mini-card
      min-width: 200px
      padding: 1rem
      
      .mini-header
        display: flex
        justify-content: space-between
        margin-bottom: 0.5rem
        
        .currency-code
          font-size: 0.7rem
          color: var(--text-muted)
          
      .mini-prices
        font-size: 0.9rem

    .error-card
      padding: 2rem
      text-align: center
      margin-bottom: 2rem
      border-color: var(--danger)
      
      p
        color: var(--danger)
        margin-bottom: 1rem
      
      button
        background: var(--danger)
        color: white
        border: none
        padding: 0.5rem 1.5rem
        border-radius: 0.5rem
        cursor: pointer

    .loader
      color: var(--primary)
      font-weight: 500
      animation: pulse 1.5s infinite

    @keyframes pulse
      0%, 100%
        opacity: 1
      50%
        opacity: 0.5
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  dolarService = inject(DolarService);

  filteredOtherRates = computed(() => {
    // Solo mostrar algunas monedas relevantes para el scroll horizontal
    return this.dolarService.otrasCotizaciones().filter((c) => c.moneda !== 'USD');
  });

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.dolarService.fetchAll();
  }

  formatDate(dateStr: string) {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return (
        date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) +
        ' ' +
        date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
      );
    } catch {
      return dateStr;
    }
  }
}
