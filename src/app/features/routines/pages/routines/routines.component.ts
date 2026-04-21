import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsBadgeComponent } from '../../../../shared/components/ds-badge/ds-badge.component';
import { DsCardComponent } from '../../../../shared/components/ds-card/ds-card.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { DsTabBarComponent } from '../../../../shared/components/ds-tab-bar/ds-tab-bar.component';

@Component({
  selector: 'app-routines',
  standalone: true,
  imports: [CommonModule, DsBadgeComponent, DsCardComponent, DsIconComponent, DsTabBarComponent],
  templateUrl: './routines.component.html',
  styleUrl: './routines.component.scss',
})
export class RoutinesComponent {
  filters = ['Todas', 'PPL', 'Full Body', 'Arnold', 'Accesorios'];
  activeFilter = 0;

  routines = [
    { name: 'Empuje · Pecho y tríceps', exercises: 6, minutes: 52, category: 'PPL', tone: 'mint', last: 'hace 2d' },
    { name: 'Tirón · Espalda y bíceps', exercises: 7, minutes: 58, category: 'PPL', tone: 'violet', last: 'hace 4d' },
    { name: 'Pierna · Cuádriceps',       exercises: 6, minutes: 65, category: 'PPL', tone: 'amber', last: 'hace 6d' },
    { name: 'Full Body A',               exercises: 8, minutes: 70, category: 'Full', tone: 'coral', last: 'hace 3s' },
    { name: 'Core + Movilidad',          exercises: 5, minutes: 30, category: 'Accessory', tone: 'mint', last: '—' },
  ];

  toneColor(tone: string): string {
    return { mint: 'var(--dme-mint)', violet: 'var(--dme-violet)', amber: 'var(--dme-amber)', coral: 'var(--dme-coral)' }[tone] ?? 'var(--dme-mint)';
  }

  toneBg(tone: string): string {
    return { mint: 'var(--dme-mint-soft)', violet: 'rgba(155,140,255,0.14)', amber: 'rgba(255,183,77,0.14)', coral: 'rgba(255,107,91,0.14)' }[tone] ?? 'var(--dme-mint-soft)';
  }
}
