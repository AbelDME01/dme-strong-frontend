import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsBadgeComponent } from '../../../../shared/components/ds-badge/ds-badge.component';
import { DsCardComponent } from '../../../../shared/components/ds-card/ds-card.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { DsTabBarComponent } from '../../../../shared/components/ds-tab-bar/ds-tab-bar.component';
import { RoutinesService } from '../../../../core/api/routines.service';
import { Routine } from '../../../../core/api/models';

@Component({
  selector: 'app-routines',
  standalone: true,
  imports: [CommonModule, DsBadgeComponent, DsCardComponent, DsIconComponent, DsTabBarComponent],
  templateUrl: './routines.component.html',
  styleUrl: './routines.component.scss',
})
export class RoutinesComponent implements OnInit {
  private routinesService = inject(RoutinesService);

  filters = ['Todas', 'PPL', 'Full Body', 'Arnold', 'Accesorios'];
  activeFilter = 0;

  routines = signal<Routine[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    this.routinesService.getAll().subscribe({
      next: (data) => {
        this.routines.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudieron cargar las rutinas');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  exerciseCount(routine: Routine): number {
    return routine.routine_exercises?.length ?? 0;
  }

  toneForIndex(i: number): string {
    const tones = ['mint', 'violet', 'amber', 'coral', 'mint'];
    return tones[i % tones.length];
  }

  toneColor(tone: string): string {
    return (
      ({
        mint: 'var(--dme-mint)',
        violet: 'var(--dme-violet)',
        amber: 'var(--dme-amber)',
        coral: 'var(--dme-coral)',
      } as Record<string, string>)[tone] ?? 'var(--dme-mint)'
    );
  }

  toneBg(tone: string): string {
    return (
      ({
        mint: 'var(--dme-mint-soft)',
        violet: 'rgba(155,140,255,0.14)',
        amber: 'rgba(255,183,77,0.14)',
        coral: 'rgba(255,107,91,0.14)',
      } as Record<string, string>)[tone] ?? 'var(--dme-mint-soft)'
    );
  }
}
