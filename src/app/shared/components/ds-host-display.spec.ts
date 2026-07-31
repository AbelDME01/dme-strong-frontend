import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DsBadgeComponent } from './ds-badge/ds-badge.component';
import { DsButtonComponent } from './ds-button/ds-button.component';
import { DsCardComponent } from './ds-card/ds-card.component';
import { DsIconComponent } from './ds-icon/ds-icon.component';
import { DsInputComponent } from './ds-input/ds-input.component';
import { DsSkeletonComponent } from './ds-skeleton/ds-skeleton.component';

/**
 * Los custom elements son `display: inline` por defecto, y los márgenes
 * verticales no se aplican a elementos inline. Sin un `:host { display: block }`
 * explícito, cualquier `margin-top` que una pantalla ponga sobre estos
 * componentes se descarta en silencio. Ya pasó una vez (se parcheó en local en
 * home-a en vez de en el componente), así que esto lo bloquea.
 *
 * Ojo: hay que montar los tags dentro de un host. `fixture.nativeElement` de un
 * componente creado directamente es un `<div>`, no su propio elemento, así que
 * medirlo daría `block` siempre.
 */
@Component({
  standalone: true,
  imports: [
    DsCardComponent,
    DsSkeletonComponent,
    DsButtonComponent,
    DsInputComponent,
    DsIconComponent,
    DsBadgeComponent,
  ],
  template: `
    <ds-card/>
    <ds-skeleton/>
    <ds-button/>
    <ds-input/>
    <ds-icon name="filter"/>
    <ds-badge/>
  `,
})
class HostComponent {}

describe('display del host de los componentes ds-', () => {
  let host: HTMLElement;

  beforeEach(() => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    host = fixture.nativeElement as HTMLElement;
    document.body.appendChild(host);
  });

  afterEach(() => host.remove());

  function displayOf(tag: string): string {
    const el = host.querySelector(tag);
    if (!el) throw new Error(`No se renderizó <${tag}>`);
    return getComputedStyle(el).display;
  }

  for (const tag of ['ds-card', 'ds-skeleton', 'ds-button', 'ds-input']) {
    it(`${tag} es block, para que los márgenes externos se apliquen`, () => {
      expect(displayOf(tag)).toBe('block');
    });
  }

  // ponytail: inline a propósito, van dentro de flujo de texto
  for (const tag of ['ds-icon', 'ds-badge']) {
    it(`${tag} sigue siendo inline`, () => {
      expect(displayOf(tag)).toBe('inline');
    });
  }
});
