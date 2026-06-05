import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ExerciseDetailComponent } from './exercise-detail.component';
import { WorkoutsService } from '../../../../core/api/workouts.service';
import { RecordsService } from '../../../../core/api/records.service';
import { ExercisesService } from '../../../../core/api/exercises.service';

describe('ExerciseDetailComponent', () => {
  function setup(workouts: unknown[], records: unknown[] = []) {
    const workoutsStub = jasmine.createSpyObj<WorkoutsService>('WorkoutsService', ['getRecentWithSets']);
    const recordsStub = jasmine.createSpyObj<RecordsService>('RecordsService', ['getAll']);
    const exercisesStub = jasmine.createSpyObj<ExercisesService>('ExercisesService', ['getById']);
    workoutsStub.getRecentWithSets.and.returnValue(of(workouts) as never);
    recordsStub.getAll.and.returnValue(of(records) as never);
    exercisesStub.getById.and.returnValue(of({ id: 'ex1', name: 'Press banca' }) as never);

    TestBed.configureTestingModule({
      imports: [ExerciseDetailComponent],
      providers: [
        provideRouter([]),
        { provide: WorkoutsService, useValue: workoutsStub },
        { provide: RecordsService, useValue: recordsStub },
        { provide: ExercisesService, useValue: exercisesStub },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'ex1' } } } },
      ],
    });
    return TestBed.createComponent(ExerciseDetailComponent);
  }

  afterEach(() => TestBed.resetTestingModule());

  it('builds the progression points from the exercise sets', () => {
    const fixture = setup([
      {
        started_at: '2024-01-01T00:00:00Z',
        workout_sets: [{ exercise_id: 'ex1', weight_kg: 80, reps: 5 }],
      },
      {
        started_at: '2024-06-01T00:00:00Z',
        workout_sets: [{ exercise_id: 'ex1', weight_kg: 90, reps: 3 }],
      },
    ]);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.activeRange.set(3); // "1A" / all-time window covers the data
    expect(cmp.exerciseName()).toBe('Press banca');
    expect(cmp.pts()).toEqual([80, 90]);
    expect(cmp.hasChart()).toBeTrue();
  });

  it('exposes the best record as prValue', () => {
    const fixture = setup(
      [{ started_at: '2024-06-01T00:00:00Z', workout_sets: [{ exercise_id: 'ex1', weight_kg: 90, reps: 3 }] }],
      [{ exercise_id: 'ex1', value: 100, achieved_at: '2024-06-01T00:00:00Z' }],
    );
    fixture.detectChanges();
    fixture.componentInstance.activeRange.set(3);
    expect(fixture.componentInstance.prValue()).toBe(100);
  });

  it('handles an exercise with no history gracefully', () => {
    const fixture = setup([]);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    expect(cmp.hasChart()).toBeFalse();
    expect(cmp.recentSets().length).toBe(0);
    expect(cmp.error()).toBeNull();
  });
});
