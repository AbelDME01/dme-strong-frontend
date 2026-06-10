import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { DashboardHomeComponent } from './dashboard-home.component';
import { WorkoutsService } from '../../../../core/api/workouts.service';
import { RecordsService } from '../../../../core/api/records.service';
import { RoutinesService } from '../../../../core/api/routines.service';
import { AuthService } from '../../../../core/auth/auth.service';

describe('DashboardHomeComponent', () => {
  function setup(workouts: unknown[], records: unknown[] = [], routines: unknown[] = []) {
    const workoutsStub = jasmine.createSpyObj<WorkoutsService>('WorkoutsService', ['getRecentWithSets', 'create']);
    const recordsStub = jasmine.createSpyObj<RecordsService>('RecordsService', ['getAll']);
    const routinesStub = jasmine.createSpyObj<RoutinesService>('RoutinesService', ['getAll']);
    workoutsStub.getRecentWithSets.and.returnValue(of(workouts) as never);
    recordsStub.getAll.and.returnValue(of(records) as never);
    routinesStub.getAll.and.returnValue(of(routines) as never);

    TestBed.configureTestingModule({
      imports: [DashboardHomeComponent, RouterTestingModule],
      providers: [
        { provide: WorkoutsService, useValue: workoutsStub },
        { provide: RecordsService, useValue: recordsStub },
        { provide: RoutinesService, useValue: routinesStub },
        { provide: AuthService, useValue: { user: () => ({ email: 'ruben@dme.app', user_metadata: { full_name: 'Rubén García' } }) } },
      ],
    });
    return TestBed.createComponent(DashboardHomeComponent);
  }

  afterEach(() => TestBed.resetTestingModule());

  it('maps recent workouts and volume from the API', () => {
    const recentDate = new Date(Date.now() - 2 * 86400000).toISOString(); // 2 days ago
    const fixture = setup([
      {
        id: 'w1',
        name: 'Empuje',
        started_at: recentDate,
        duration_seconds: 3000,
        workout_sets: [{ weight_kg: 100, reps: 5 }, { weight_kg: 100, reps: 5 }],
      },
    ]);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    expect(cmp.filteredWorkouts().length).toBe(1);
    expect(cmp.filteredWorkouts()[0].name).toBe('Empuje');
    expect(cmp.filteredWorkouts()[0].sets).toBe(2);
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
