import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DsBadgeComponent } from '../../../../shared/components/ds-badge/ds-badge.component';
import { DsButtonComponent } from '../../../../shared/components/ds-button/ds-button.component';
import { DsCardComponent } from '../../../../shared/components/ds-card/ds-card.component';
import { DsIconComponent } from '../../../../shared/components/ds-icon/ds-icon.component';
import { DsTabBarComponent } from '../../../../shared/components/ds-tab-bar/ds-tab-bar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, DsBadgeComponent, DsButtonComponent, DsCardComponent, DsIconComponent, DsTabBarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  bodyStats = [
    { label: 'Peso', value: '78.4', unit: 'kg', trend: '-0.6' },
    { label: 'Altura', value: '178', unit: 'cm', trend: null },
    { label: '% Grasa', value: '14.2', unit: '%', trend: '-0.3' },
  ];

  accountMenu = [
    { icon: 'user',     label: 'Editar perfil',         route: '/profile/edit', right: null },
    { icon: 'ruler',    label: 'Medidas corporales',     route: null, right: null },
    { icon: 'trophy',   label: 'Mis récords',            route: null, right: '12' },
    { icon: 'dumbbell', label: 'Equipamiento',           route: null, right: null },
  ];

  prefsMenu = [
    { icon: 'bell',   label: 'Notificaciones', right: null },
    { icon: 'weight', label: 'Unidades',       right: 'kg · cm' },
    { icon: 'note',   label: 'Idioma',         right: 'Español' },
  ];
}
