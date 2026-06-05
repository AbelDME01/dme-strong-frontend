import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsIconComponent } from '../ds-icon/ds-icon.component';

@Component({
  selector: 'ds-input',
  standalone: true,
  imports: [CommonModule, DsIconComponent],
  template: `
    <div class="ds-input-wrap">
      <div *ngIf="label" class="ds-input-label">{{ label }}</div>
      <div class="ds-input-field">
        <ds-icon *ngIf="icon" [name]="icon" [size]="18" color="var(--dme-text-dim)"/>
        <div class="ds-input-text" [class.ds-input-text--placeholder]="!value">
          {{ value || placeholder }}
        </div>
        <ng-content select="[slot=right]"/>
      </div>
    </div>
  `,
  styles: [`
    .ds-input-wrap { width: 100%; }
    .ds-input-label {
      font-size: 12px;
      color: var(--dme-text-dim);
      margin-bottom: 8px;
      font-weight: 500;
      letter-spacing: 0.2px;
      text-transform: uppercase;
    }
    .ds-input-field {
      height: 52px;
      background: var(--dme-surface2);
      border-radius: 14px;
      border: 1px solid var(--dme-border);
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 10px;
    }
    .ds-input-text {
      flex: 1;
      color: var(--dme-text);
      font-size: 15px;
      font-family: var(--dme-font);
      &--placeholder { color: var(--dme-text-mute); }
    }
  `],
})
export class DsInputComponent {
  @Input() label?: string;
  @Input() value?: string;
  @Input() placeholder?: string;
  @Input() icon?: string;
}
