import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsIconComponent } from '../ds-icon/ds-icon.component';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'ds-button',
  standalone: true,
  imports: [CommonModule, DsIconComponent],
  template: `
    <button
      [class]="'ds-btn ds-btn--' + variant + ' ds-btn--' + size"
      [class.ds-btn--full]="full"
      [class.ds-btn--disabled]="disabled"
      [disabled]="disabled"
      (click)="clicked.emit($event)">
      <ds-icon *ngIf="icon" [name]="icon" [size]="iconSize" [color]="iconColor"/>
      <ng-content/>
      <ds-icon *ngIf="iconRight" [name]="iconRight" [size]="iconSize" [color]="iconColor"/>
    </button>
  `,
  styles: [`
    .ds-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: none;
      cursor: pointer;
      font-family: var(--dme-font);
      font-weight: 600;
      letter-spacing: -0.2px;
      transition: transform 0.12s, opacity 0.12s;
      white-space: nowrap;

      &:disabled, &--disabled { opacity: 0.45; cursor: not-allowed; }
      &:active:not(:disabled) { transform: scale(0.97); }
      &--full { width: 100%; }

      &--sm  { height: 32px; padding: 0 12px; font-size: 13px; border-radius: 10px; }
      &--md  { height: 44px; padding: 0 18px; font-size: 15px; border-radius: 14px; }
      &--lg  { height: 54px; padding: 0 22px; font-size: 16px; border-radius: 16px; }
      &--xl  { height: 64px; padding: 0 26px; font-size: 18px; border-radius: 20px; }

      &--primary  {
        background: var(--dme-mint); color: #06201B; border: none;
        @media (hover: hover) { &:hover:not(:disabled) { filter: brightness(1.08); } }
      }
      &--secondary {
        background: var(--dme-surface2); color: var(--dme-text); border: 1px solid var(--dme-border);
        @media (hover: hover) { &:hover:not(:disabled) { background: var(--dme-surface3); border-color: var(--dme-border-strong); } }
      }
      &--ghost {
        background: transparent; color: var(--dme-text); border: 1px solid var(--dme-border-strong);
        @media (hover: hover) { &:hover:not(:disabled) { background: var(--dme-surface2); } }
      }
      &--danger {
        background: rgba(255,107,91,0.12); color: var(--dme-coral); border: 1px solid rgba(255,107,91,0.25);
        @media (hover: hover) { &:hover:not(:disabled) { background: rgba(255,107,91,0.2); border-color: rgba(255,107,91,0.4); } }
      }
      &--soft {
        background: var(--dme-mint-soft); color: var(--dme-mint); border: none;
        @media (hover: hover) { &:hover:not(:disabled) { background: rgba(0,229,160,0.2); } }
      }
    }
  `],
})
export class DsButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() icon?: string;
  @Input() iconRight?: string;
  @Input() full = false;
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<MouseEvent>();

  get iconSize(): number {
    return { sm: 16, md: 18, lg: 19, xl: 21 }[this.size];
  }

  get iconColor(): string {
    return { primary: '#06201B', secondary: 'var(--dme-text)', ghost: 'var(--dme-text)', danger: 'var(--dme-coral)', soft: 'var(--dme-mint)' }[this.variant];
  }
}
