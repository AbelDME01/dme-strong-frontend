import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import { DsButtonComponent } from '../ds-button/ds-button.component';

/**
 * Modal de confirmación del design system, acorde a la UI oscura de la app.
 * Uso declarativo controlado por una signal externa:
 *   <ds-modal [open]="open()" title="…" message="…" [danger]="true"
 *             (confirmed)="…" (cancelled)="…" />
 * Cerrar con click en el overlay o tecla Escape equivale a cancelar.
 */
@Component({
  selector: 'ds-modal',
  standalone: true,
  imports: [DsButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="ds-modal" (click)="onOverlayClick()">
        <div
          class="ds-modal__card"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title()"
          (click)="$event.stopPropagation()">
          <h2 class="ds-modal__title">{{ title() }}</h2>
          @if (message()) {
            <p class="ds-modal__message">{{ message() }}</p>
          }
          <div class="ds-modal__actions">
            <ds-button variant="ghost" size="md" (clicked)="cancel()">
              {{ cancelText() }}
            </ds-button>
            <ds-button
              [variant]="danger() ? 'danger' : 'primary'"
              size="md"
              (clicked)="confirm()">
              {{ confirmText() }}
            </ds-button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .ds-modal {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: rgba(3, 8, 10, 0.62);
      backdrop-filter: blur(4px);
      animation: ds-modal-fade 0.16s ease-out;
    }

    .ds-modal__card {
      width: 100%;
      max-width: 360px;
      padding: 22px;
      background: var(--dme-surface2);
      border: 1px solid var(--dme-border);
      border-radius: var(--dme-radius-lg);
      font-family: var(--dme-font);
      animation: ds-modal-pop 0.18s ease-out;
    }

    .ds-modal__title {
      margin: 0;
      color: var(--dme-text);
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }

    .ds-modal__message {
      margin: 10px 0 0;
      color: var(--dme-text-dim);
      font-size: 15px;
      line-height: 1.45;
    }

    .ds-modal__actions {
      display: flex;
      gap: 10px;
      margin-top: 22px;

      ds-button { flex: 1; }
    }

    @keyframes ds-modal-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes ds-modal-pop {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `],
})
export class DsModalComponent {
  readonly open = input(false, { transform: booleanAttribute });
  readonly title = input('');
  readonly message = input('');
  readonly confirmText = input('Confirmar');
  readonly cancelText = input('Cancelar');
  readonly danger = input(false, { transform: booleanAttribute });

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  confirm(): void {
    this.confirmed.emit();
  }

  cancel(): void {
    this.cancelled.emit();
  }

  onOverlayClick(): void {
    this.cancel();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.cancel();
  }
}
