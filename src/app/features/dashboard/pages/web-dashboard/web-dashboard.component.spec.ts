import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WebDashboardComponent } from './web-dashboard.component';
import { WorkoutsService } from '../../../../core/api/workouts.service';
import { RecordsService } from '../../../../core/api/records.service';
import { AuthService } from '../../../../core/auth/auth.service';

describe('WebDashboardComponent', () => {
  function setup(workouts: unknown[], records: unknown[] = []) {
    const workoutsStub = jasmine.createSpyObj<WorkoutsService>('WorkoutsService', ['getRecentWithSets']);
    const recordsStub = jasmine.createSpyObj<RecordsService>('RecordsService', ['getAll']);
    workoutsStub.getRecentWithSets.and.returnValue(of(workouts) as never);
    recordsStub.getAll.and.returnValue(of(records) as never);

    TestBed.configureTestingModule({
      imports: [WebDashboardComponent],
      providers: [
        { provide: WorkoutsService, useValue: workoutsStub },
        { provide: RecordsService, useValue: recordsStub },
        { provide: AuthService, useValue: { user: () => ({ email: 'ruben@dme.app', user_metadata: { full_name: 'Rubén García' } }) } },
      ],
    });
    return TestBed.createComponent(WebDashboardComponent);
  }

  afterEach(() => TestBed.resetTestingModule());

  it('maps recent workouts and volume from the API', () => {
    const fixture = setup([
      {
        name: 'Empuje',
        started_at: '2024-06-01T10:00:00Z',
        duration_seconds: 3000,
        workout_sets: [{ weight_kg: 100, reps: 5 }, { weight_kg: 100, reps: 5 }],
      },
    ]);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    expect(cmp.recentWorkouts().length).toBe(1);
    expect(cmp.recentWorkouts()[0].name).toBe('Empuje');
    expect(cmp.recentWorkouts()[0].sets).toBe(2);
    expect(cmp.volumeBars().length).toBe(1);
    expect(cmp.loading()).toBeFalse();
  });

  it('derives the first name for the greeting', () => {
    const fixture = setup([]);
    fixture.detectChanges();
    expect(fixture.componentInstance.displayName()).toBe('Rubén');
  });

  it('orders recent PRs by date, newest first', () => {
    const fixture = setup(
      [],
      [
        { value: 90, unit: 'kg', achieved_at: '2024-01-01T00:00:00Z', exercises: { name: 'Sentadilla' } },
        { value: 100, unit: 'kg', achieved_at: '2024-06-01T00:00:00Z', exercises: { name: 'Peso muerto' } },
      ],
    );
    fixture.detectChanges();
    const prs = fixture.componentInstance.recentPRs();
    expect(prs[0].exercise).toBe('Peso muerto');
    expect(prs[0].weight).toBe('100 kg');
  });
});
