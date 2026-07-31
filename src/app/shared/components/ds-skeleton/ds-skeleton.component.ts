import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="ds-skeleton" [style.width]="width" [style.height]="height" [style.border-radius]="radius"></div>`,
  styles: [`
    :host { display: block; }

    .ds-skeleton {
      background: linear-gradient(
        90deg,
        var(--dme-surface2) 25%,
        var(--dme-surface3) 50%,
        var(--dme-surface2) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite linear;
      display: block;
    }

    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class DsSkeletonComponent {
  @Input() width = '100%';
  @Input() height = '16px';
  @Input() radius = '8px';
}
