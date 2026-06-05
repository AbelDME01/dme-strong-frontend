import { Component, Input } from '@angular/core';

export type BadgeTone = 'neutral' | 'mint' | 'coral' | 'amber' | 'violet';

@Component({
  selector: 'ds-badge',
  standalone: true,
  template: `<span class="ds-badge" [class]="'ds-badge--' + tone"><ng-content/></span>`,
  styles: [`
    .ds-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.2px;
      text-transform: uppercase;

      &--neutral { background: rgba(255,255,255,0.06); color: var(--dme-text-dim); }
      &--mint    { background: var(--dme-mint-soft); color: var(--dme-mint); }
      &--coral   { background: rgba(255,107,91,0.14); color: var(--dme-coral); }
      &--amber   { background: rgba(255,183,77,0.14); color: var(--dme-amber); }
      &--violet  { background: rgba(155,140,255,0.14); color: var(--dme-violet); }
    }
  `],
})
export class DsBadgeComponent {
  @Input() tone: BadgeTone = 'neutral';
}
