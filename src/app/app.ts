import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ConverterComponent } from './components/converter/converter.component';
import { WalletsComponent } from './components/wallets/wallets.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DashboardComponent, ConverterComponent, WalletsComponent],
  template: `
    <div class="app-layout">
      <nav class="main-nav">
        <div class="nav-content glass-card">
          <div class="logo">
            <span class="logo-icon">💸</span>
            <span class="logo-text">ArgenDolar</span>
          </div>
          <div class="nav-links">
            <button [class.active]="view() === 'dashboard'" (click)="view.set('dashboard')">
              Dólar
            </button>
            <button [class.active]="view() === 'wallets'" (click)="view.set('wallets')">
              Inversión
            </button>
            <button [class.active]="view() === 'converter'" (click)="view.set('converter')">
              Conversor
            </button>
          </div>
        </div>
      </nav>

      <main class="content-area">
        @switch (view()) { @case ('dashboard') { <app-dashboard /> } @case ('wallets') {
        <app-wallets /> } @case ('converter') { <app-converter /> } }
      </main>

      <footer class="main-footer">
        <p>
          Fuentes: <a href="https://dolarapi.com" target="_blank">DolarApi.com</a> y
          <a href="https://argentinadatos.com" target="_blank">ArgentinaDatos.com</a>
        </p>
        <p class="copyright">&copy; 2025 ArgenDolar Dashboard</p>
      </footer>
    </div>
  `,
  styles: `
    .app-layout
      min-height: 100vh
      display: flex
      flex-direction: column
      
    .main-nav
      padding: 1.5rem 2rem
      position: sticky
      top: 0
      z-index: 100
      
      .nav-content
        max-width: 1200px
        margin: 0 auto
        padding: 0.75rem 2rem
        display: flex
        justify-content: space-between
        align-items: center
        border-radius: 1.5rem
        
    .logo
      display: flex
      align-items: center
      gap: 0.75rem
      
      .logo-icon
        font-size: 1.5rem
      .logo-text
        font-weight: 700
        font-size: 1.25rem
        background: linear-gradient(135deg, #fff 0%, var(--primary) 100%)
        -webkit-background-clip: text
        -webkit-text-fill-color: transparent

    .nav-links
      display: flex
      gap: 0.5rem
      
      button
        background: transparent
        border: none
        color: var(--text-muted)
        padding: 0.5rem 1rem
        border-radius: 0.75rem
        font-weight: 600
        cursor: pointer
        transition: all 0.3s
        font-size: 0.9rem
        
        &:hover
          color: var(--text-main)
          background: var(--glass)
          
        &.active
          color: var(--text-main)
          background: var(--primary)
          box-shadow: 0 4px 12px var(--primary-glow)

    .content-area
      flex: 1
      position: relative
      
    .main-footer
      padding: 3rem 2rem
      text-align: center
      color: var(--text-muted)
      font-size: 0.85rem
      
      a
        color: var(--primary)
        text-decoration: none
        &:hover
          text-decoration: underline
      
      .copyright
        margin-top: 0.5rem
        opacity: 0.5

    @media (max-width: 600px)
      .main-nav
        padding: 1rem 0.5rem
      .logo-text
        display: none
      .nav-links button
        padding: 0.5rem 0.75rem
        font-size: 0.8rem
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  view = signal<'dashboard' | 'wallets' | 'converter'>('dashboard');
}
