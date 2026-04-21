import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DsIconComponent } from '../ds-icon/ds-icon.component';

interface Tab {
  id: string;
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'ds-tab-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, DsIconComponent],
  template: `
    <div class="ds-tabbar">
      <a *ngFor="let tab of tabs"
         [routerLink]="tab.route"
         routerLinkActive
         #rla="routerLinkActive"
         class="ds-tabbar__tab"
         [class.ds-tabbar__tab--active]="rla.isActive || active === tab.id">
        <ds-icon [name]="tab.icon" [size]="22"
          [color]="(rla.isActive || active === tab.id) ? 'var(--dme-mint)' : 'var(--dme-text-mute)'"/>
        <span class="ds-tabbar__label">{{ tab.label }}</span>
      </a>
    </div>
  `,
  styles: [`
    .ds-tabbar {
      position: absolute;
      left: 14px;
      right: 14px;
      bottom: 28px;
      height: 68px;
      border-radius: 28px;
      background: rgba(18, 23, 26, 0.82);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid var(--dme-border);
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 0 6px;
      z-index: 30;
    }

    .ds-tabbar__tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 8px 10px;
      border-radius: 18px;
      color: var(--dme-text-mute);
      text-decoration: none;
      &--active { color: var(--dme-mint); }
    }

    .ds-tabbar__label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.2px;
    }
  `],
})
export class DsTabBarComponent {
  @Input() active = 'home';

  tabs: Tab[] = [
    { id: 'home',     icon: 'home',     label: 'Inicio',   route: '/home' },
    { id: 'routines', icon: 'dumbbell', label: 'Rutinas',  route: '/routines' },
    { id: 'history',  icon: 'calendar', label: 'Historial',route: '/history' },
    { id: 'stats',    icon: 'chart',    label: 'Progreso', route: '/stats' },
    { id: 'profile',  icon: 'user',     label: 'Perfil',   route: '/profile' },
  ];
}
