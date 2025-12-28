import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DolarService } from '../../services/dolar.service';

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DecimalPipe],
  template: `
    <div class="converter-wrapper glass-card">
      <div class="converter-header">
        <h2>Conversor de Moneda</h2>
        <p>Precios de referencia (Venta)</p>
      </div>

      <div class="converter-body">
        <div class="input-group">
          <label>Tengo</label>
          <div class="field-row">
            <input type="number" [(ngModel)]="amount" placeholder="0.00" class="main-input" />
            <select [(ngModel)]="fromCurrency" class="currency-select">
              <option value="ARS">ARS - Pesos</option>
              @for (d of dolarService.dolares(); track d.casa) {
              <option [value]="'USD-' + d.casa">USD - {{ d.nombre }}</option>
              } @for (c of dolarService.otrasCotizaciones(); track c.casa) { @if (c.moneda !==
              'USD') {
              <option [value]="c.moneda + '-' + c.casa">{{ c.moneda }} - {{ c.nombre }}</option>
              } }
            </select>
          </div>
        </div>

        <div class="swap-icon" (click)="swap()">
          <span>⇄</span>
        </div>

        <div class="input-group">
          <label>Quiero</label>
          <div class="field-row">
            <div class="result-display main-input">
              {{ result() | number : '1.2-2' }}
            </div>
            <select [(ngModel)]="toCurrency" class="currency-select">
              <option value="ARS">ARS - Pesos</option>
              @for (d of dolarService.dolares(); track d.casa) {
              <option [value]="'USD-' + d.casa">USD - {{ d.nombre }}</option>
              } @for (c of dolarService.otrasCotizaciones(); track c.casa) { @if (c.moneda !==
              'USD') {
              <option [value]="c.moneda + '-' + c.casa">{{ c.moneda }} - {{ c.nombre }}</option>
              } }
            </select>
          </div>
        </div>
      </div>

      <div class="converter-footer">
        @if (rateInfo()) {
        <p class="rate-note">
          1 {{ rateInfo()?.from }} = {{ rateInfo()?.val | number : '1.2-2' }} {{ rateInfo()?.to }}
        </p>
        }
      </div>
    </div>
  `,
  styles: `
    .converter-wrapper
      padding: 2rem
      max-width: 600px
      margin: 2rem auto
      
    .converter-header
      margin-bottom: 2rem
      h2
        font-size: 1.5rem
        margin-bottom: 0.25rem
      p
        color: var(--text-muted)
        font-size: 0.85rem

    .converter-body
      display: flex
      flex-direction: column
      gap: 1.5rem

    .input-group
      display: flex
      flex-direction: column
      gap: 0.5rem
      label
        font-size: 0.75rem
        font-weight: 600
        text-transform: uppercase
        color: var(--text-muted)
        margin-left: 0.5rem

    .field-row
      display: flex
      gap: 0.5rem

    .main-input
      flex: 1
      background: var(--glass)
      border: 1px solid var(--border)
      border-radius: 1rem
      padding: 1rem
      font-size: 1.5rem
      font-weight: 700
      color: var(--text-main)
      outline: none
      transition: all 0.3s
      
      &::placeholder
        color: var(--border)
        
      &:focus
        border-color: var(--primary)
        background: rgba(255, 255, 255, 0.08)

    .result-display
      display: flex
      align-items: center
      overflow-x: auto
      white-space: nowrap

    .currency-select
      width: 160px
      background: var(--bg-dark)
      border: 1px solid var(--border)
      border-radius: 1rem
      padding: 0 1rem
      color: var(--text-main)
      cursor: pointer
      font-weight: 500
      
      &:focus
        border-color: var(--primary)

    .swap-icon
      align-self: center
      width: 40px
      height: 40px
      display: flex
      align-items: center
      justify-content: center
      background: var(--primary)
      border-radius: 50%
      cursor: pointer
      font-size: 1.25rem
      transition: transform 0.3s
      
      &:hover
        transform: rotate(180deg) scale(1.1)
        box-shadow: 0 0 20px var(--primary-glow)

    .converter-footer
      margin-top: 2rem
      text-align: center
      
      .rate-note
        color: var(--text-muted)
        font-size: 0.85rem
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConverterComponent {
  dolarService = inject(DolarService);

  amount = signal<number>(1);
  fromCurrency = signal<string>('USD-blue');
  toCurrency = signal<string>('ARS');

  rateInfo = computed(() => {
    const from = this.fromCurrency();
    const to = this.toCurrency();

    const fromRate = this.getRate(from);
    const toRate = this.getRate(to);

    if (fromRate && toRate) {
      const val = fromRate / toRate;
      return {
        from: from.split('-')[0],
        to: to.split('-')[0],
        val,
      };
    }
    return null;
  });

  result = computed(() => {
    const info = this.rateInfo();
    return info ? this.amount() * info.val : 0;
  });

  private getRate(currencyId: string): number {
    if (currencyId === 'ARS') return 1;

    const [code, casa] = currencyId.split('-');

    if (code === 'USD') {
      const find = this.dolarService.dolares().find((d) => d.casa === casa);
      return find ? find.venta : 1;
    } else {
      const find = this.dolarService
        .otrasCotizaciones()
        .find((c) => c.moneda === code && c.casa === casa);
      return find ? find.venta : 1;
    }
  }

  swap() {
    const temp = this.fromCurrency();
    this.fromCurrency.set(this.toCurrency());
    this.toCurrency.set(temp);
  }
}
