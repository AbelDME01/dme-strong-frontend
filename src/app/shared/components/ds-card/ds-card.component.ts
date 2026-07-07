import { Component, Input } from '@angular/core';

@Component({
  selector: 'ds-card',
  standalone: true,
  template: `<div class="ds-card"
    [class.ds-card--raised]="raised"
    [class.ds-card--interactive]="interactive"
    [style.padding.px]="pad"><ng-content/></div>`,
  styles: [`
    .ds-card {
      background: var(--dme-surface);
      border: 1px solid var(--dme-border);
      border-radius: 18px;
      &--raised { background: var(--dme-surface2); }
      &--interactive {
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s, transform 0.1s;
        @media (hover: hover) {
          &:hover {
            border-color: rgba(0, 229, 160, 0.35);
            background: var(--dme-surface2);
          }
        }
        &:active { transform: scale(0.995); }
      }
      &--raised#{&}--interactive {
        @media (hover: hover) {
          &:hover { background: var(--dme-surface3); }
        }
      }
    }
  `],
})
export class DsCardComponent {
  @Input() pad = 16;
  @Input() raised = false;
  @Input() interactive = false;
}
