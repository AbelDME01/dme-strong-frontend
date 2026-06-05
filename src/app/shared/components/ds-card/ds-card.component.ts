import { Component, Input } from '@angular/core';

@Component({
  selector: 'ds-card',
  standalone: true,
  template: `<div class="ds-card" [class.ds-card--raised]="raised" [style.padding.px]="pad"><ng-content/></div>`,
  styles: [`
    .ds-card {
      background: var(--dme-surface);
      border: 1px solid var(--dme-border);
      border-radius: 18px;
      &--raised { background: var(--dme-surface2); }
    }
  `],
})
export class DsCardComponent {
  @Input() pad = 16;
  @Input() raised = false;
}
