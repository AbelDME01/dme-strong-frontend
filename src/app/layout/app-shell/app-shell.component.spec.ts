import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { AppShellComponent } from './app-shell.component';

@Component({ standalone: true, template: '' })
class DummyComponent {}

describe('AppShellComponent', () => {
  let fixture: ComponentFixture<AppShellComponent>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'plain', component: DummyComponent },
          { path: 'hidden', component: DummyComponent, data: { hideTabBar: true } },
        ]),
      ],
    });
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
  });

  it('shows the tab bar on routes without hideTabBar', async () => {
    await router.navigate(['/plain']);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ds-tab-bar')).toBeTruthy();
  });

  it('hides the tab bar on routes with data.hideTabBar', async () => {
    await router.navigate(['/hidden']);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ds-tab-bar')).toBeNull();
  });

  it('renders the desktop chrome components', () => {
    expect(fixture.nativeElement.querySelector('app-side-nav')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-top-bar')).toBeTruthy();
  });
});
