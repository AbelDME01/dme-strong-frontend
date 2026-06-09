import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DsButtonComponent } from '../../shared/components/ds-button/ds-button.component';
import { DsIconComponent } from '../../shared/components/ds-icon/ds-icon.component';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [DsButtonComponent, DsIconComponent],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
})
export class TopBarComponent {
  private router = inject(Router);

  startWorkout(): void {
    void this.router.navigate(['/workout/active']);
  }
}
