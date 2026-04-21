import { Component, Input } from '@angular/core';

@Component({
  selector: 'ds-logo',
  standalone: true,
  template: `
    <div class="ds-logo">
      <div class="ds-logo__icon" [style.width.px]="size" [style.height.px]="size" [style.border-radius.px]="size * 0.28">
        <svg [attr.width]="size * 0.58" [attr.height]="size * 0.58" viewBox="0 0 24 24" fill="none">
          <path d="M4 10v4M7 7v10M17 7v10M20 10v4M7 12h10" stroke="#06201B" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="ds-logo__text" [style.font-size.px]="size * 0.62">
        dme<span class="ds-logo__accent">strong</span>
      </div>
    </div>
  `,
  styles: [`
    .ds-logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .ds-logo__icon {
      background: linear-gradient(135deg, var(--dme-mint) 0%, var(--dme-mint-dim) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0, 229, 160, 0.35);
    }
    .ds-logo__text {
      font-weight: 800;
      letter-spacing: -0.8px;
      color: var(--dme-text);
    }
    .ds-logo__accent {
      color: var(--dme-mint);
    }
  `],
})
export class DsLogoComponent {
  @Input() size = 32;
}
