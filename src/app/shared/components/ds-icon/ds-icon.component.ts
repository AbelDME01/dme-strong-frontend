import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24"
         [style.display]="'inline-block'" [style.flex-shrink]="'0'">
      <ng-container [ngSwitch]="name">

        <path *ngSwitchCase="'home'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"
          d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z"/>

        <path *ngSwitchCase="'dumbbell'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"
          d="M3 9v6M6 6v12M18 6v12M21 9v6M6 12h12"/>

        <ng-container *ngSwitchCase="'calendar'">
          <rect fill="none" [attr.stroke]="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" x="3" y="5" width="18" height="16" rx="2"/>
          <path fill="none" [attr.stroke]="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M8 3v4M16 3v4"/>
        </ng-container>

        <path *ngSwitchCase="'chart'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"
          d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>

        <ng-container *ngSwitchCase="'user'">
          <circle fill="none" [attr.stroke]="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" cx="12" cy="8" r="4"/>
          <path fill="none" [attr.stroke]="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
        </ng-container>

        <path *ngSwitchCase="'plus'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/>

        <path *ngSwitchCase="'check'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round" d="M4 12l5 5L20 6"/>

        <path *ngSwitchCase="'play'" [attr.fill]="color" d="M7 5v14l12-7z"/>

        <ng-container *ngSwitchCase="'pause'">
          <rect [attr.fill]="color" x="6" y="5" width="4" height="14" rx="1"/>
          <rect [attr.fill]="color" x="14" y="5" width="4" height="14" rx="1"/>
        </ng-container>

        <path *ngSwitchCase="'chevron'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/>

        <path *ngSwitchCase="'chevronL'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6"/>

        <path *ngSwitchCase="'chevronD'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/>

        <path *ngSwitchCase="'close'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6l-12 12"/>

        <ng-container *ngSwitchCase="'more'">
          <circle [attr.fill]="color" cx="5" cy="12" r="1.8"/>
          <circle [attr.fill]="color" cx="12" cy="12" r="1.8"/>
          <circle [attr.fill]="color" cx="19" cy="12" r="1.8"/>
        </ng-container>

        <ng-container *ngSwitchCase="'search'">
          <circle fill="none" [attr.stroke]="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" cx="11" cy="11" r="7"/>
          <path fill="none" [attr.stroke]="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M20 20l-3.5-3.5"/>
        </ng-container>

        <ng-container *ngSwitchCase="'settings'">
          <circle fill="none" [attr.stroke]="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" cx="12" cy="12" r="3"/>
          <path fill="none" [attr.stroke]="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5v.2a2 2 0 01-4 0V21a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9A1.7 1.7 0 0010 3.6V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1h.2a2 2 0 010 4H21a1.7 1.7 0 00-1.5 1z"/>
        </ng-container>

        <path *ngSwitchCase="'bell'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"
          d="M18 16V11a6 6 0 10-12 0v5l-2 3h16l-2-3zM10 20a2 2 0 004 0"/>

        <path *ngSwitchCase="'trophy'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"
          d="M7 4h10v4a5 5 0 01-10 0V4zM5 5H3v2a4 4 0 004 4M19 5h2v2a4 4 0 01-4 4M12 13v4M8 21h8M9 17h6v4H9z"/>

        <ng-container *ngSwitchCase="'clock'">
          <circle fill="none" [attr.stroke]="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" cx="12" cy="12" r="9"/>
          <path fill="none" [attr.stroke]="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 2"/>
        </ng-container>

        <path *ngSwitchCase="'weight'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"
          d="M5 8h14l-2 12H7L5 8zM9 8V6a3 3 0 016 0v2"/>

        <ng-container *ngSwitchCase="'timer'">
          <circle fill="none" [attr.stroke]="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" cx="12" cy="13" r="8"/>
          <path fill="none" [attr.stroke]="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M12 9v4l2 2M9 2h6M12 5v2"/>
        </ng-container>

        <path *ngSwitchCase="'note'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"
          d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6zM14 3v6h6M9 14h6M9 17h4"/>

        <path *ngSwitchCase="'trend'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"
          d="M3 17l6-6 4 4 8-8M14 7h7v7"/>

        <path *ngSwitchCase="'ruler'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"
          d="M3 17L17 3l4 4L7 21l-4-4zM7 13l2 2M11 9l2 2M15 5l2 2"/>

        <path *ngSwitchCase="'fire'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"
          d="M12 2C8 6 6 9 6 13a6 6 0 0012 0c0-2-1-4-2-5-1 2-2 2-3 1 0-3-1-5-1-7z"/>

        <path *ngSwitchCase="'star'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"
          d="M12 3l2.7 6 6.3.6-4.8 4.3 1.5 6.1L12 17l-5.7 3 1.5-6.1L3 9.6l6.3-.6L12 3z"/>

        <path *ngSwitchCase="'filter'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"
          d="M3 5h18l-7 9v6l-4-2v-4L3 5z"/>

        <path *ngSwitchCase="'sort'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"
          d="M3 6h18M6 12h12M10 18h4"/>

        <path *ngSwitchCase="'edit'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"
          d="M4 20h4l10-10-4-4L4 16v4zM14 6l4 4"/>

        <path *ngSwitchCase="'trash'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"
          d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M5 6l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14"/>

        <path *ngSwitchCase="'logout'" fill="none" [attr.stroke]="color" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"
          d="M9 4H5a2 2 0 00-2 2v12a2 2 0 002 2h4M16 17l5-5-5-5M9 12h12"/>

        <path *ngSwitchCase="'apple'" [attr.fill]="color"
          d="M17.1 12.5c0-2.3 1.9-3.4 2-3.4-1.1-1.6-2.7-1.8-3.3-1.8-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.4 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.3.6-.9.9-1.8 1.2-2.8-1.7-.6-2.6-2.4-2.6-3.7zM14.8 5.7c.6-.8 1.1-1.9 1-3-.9.1-2 .6-2.7 1.4-.6.7-1.1 1.9-1 2.9.9.1 2-.5 2.7-1.3z"/>

        <ng-container *ngSwitchCase="'google'">
          <path fill="#4285F4" d="M22 12c0-.7-.1-1.4-.2-2.1H12v4.2h5.6c-.2 1.3-1 2.4-2 3.1v2.5h3.3c1.9-1.8 3.1-4.4 3.1-7.7z"/>
          <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H2.9v2.6A10 10 0 0012 22z"/>
          <path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H2.9A10 10 0 002 12c0 1.6.4 3.2 1 4.6l3.4-2.6z"/>
          <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0012 2 10 10 0 002.9 7.4L6.4 10c.8-2.4 3-4.1 5.6-4.1z"/>
        </ng-container>

        <path *ngSwitchDefault fill="none"/>
      </ng-container>
    </svg>
  `,
})
export class DsIconComponent {
  @Input() name: string = '';
  @Input() size: number = 20;
  @Input() color: string = 'currentColor';
}
