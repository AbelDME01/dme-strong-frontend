import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsCardComponent } from '../../../../shared/components/ds-card/ds-card.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { DsLogoComponent } from '../../../../shared/components/ds-logo/ds-logo.component';
import { DsTabBarComponent } from '../../../../shared/components/ds-tab-bar/ds-tab-bar.component';

@Component({
  selector: 'app-home-b',
  standalone: true,
  imports: [CommonModule, DsCardComponent, DsIconComponent, DsLogoComponent, DsTabBarComponent],
  templateUrl: './home-b.component.html',
  styleUrl: './home-b.component.scss',
})
export class HomeBComponent {
  ringCircumference = 2 * Math.PI * 36;
  ringOffset = this.ringCircumference * (1 - 0.68);

  quickActions = [
    { icon: 'plus',   label: 'Entreno libre',  tone: 'mint' },
    { icon: 'ruler',  label: 'Medidas',         tone: 'violet' },
    { icon: 'trend',  label: 'Ver progreso',    tone: 'amber' },
    { icon: 'trophy', label: 'Récords',          tone: 'coral' },
  ];

  getIconColor(tone: string): string {
    return { mint: 'var(--dme-mint)', violet: 'var(--dme-violet)', amber: 'var(--dme-amber)', coral: 'var(--dme-coral)' }[tone] ?? 'var(--dme-mint)';
  }

  getIconBg(tone: string): string {
    return { mint: 'var(--dme-mint-soft)', violet: 'rgba(155,140,255,0.14)', amber: 'rgba(255,183,77,0.14)', coral: 'rgba(255,107,91,0.14)' }[tone] ?? 'var(--dme-mint-soft)';
  }
}
