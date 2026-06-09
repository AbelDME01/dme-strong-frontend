import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EditProfileComponent } from './edit-profile.component';
import { UsersService } from '../../../../core/api/users.service';
import { MeasurementsService } from '../../../../core/api/measurements.service';
import { AuthService } from '../../../../core/auth/auth.service';

describe('EditProfileComponent', () => {
  let usersStub: jasmine.SpyObj<UsersService>;
  let measurementsStub: jasmine.SpyObj<MeasurementsService>;

  beforeEach(async () => {
    usersStub = jasmine.createSpyObj<UsersService>('UsersService', ['getProfile', 'updateProfile']);
    measurementsStub = jasmine.createSpyObj<MeasurementsService>('MeasurementsService', ['create']);
    usersStub.getProfile.and.returnValue(
      of({ id: 'p1', full_name: 'QA User', height_cm: 178 }) as never,
    );
    usersStub.updateProfile.and.returnValue(of({ id: 'p1' }) as never);
    measurementsStub.create.and.returnValue(of({ id: 'm1' }) as never);

    await TestBed.configureTestingModule({
      imports: [EditProfileComponent],
      providers: [
        provideRouter([]),
        { provide: UsersService, useValue: usersStub },
        { provide: MeasurementsService, useValue: measurementsStub },
        { provide: AuthService, useValue: { user: () => ({ email: 'qa@dme.app' }) } },
      ],
    }).compileComponents();
  });

  it('loads the profile into the form on init', () => {
    const fixture = TestBed.createComponent(EditProfileComponent);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    expect(cmp.fullName()).toBe('QA User');
    expect(cmp.heightCm()).toBe('178');
    expect(cmp.loading()).toBeFalse();
  });

  it('save() sends the camelCase payload', () => {
    const fixture = TestBed.createComponent(EditProfileComponent);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.fullName.set('New Name');
    cmp.heightCm.set('182');
    cmp.save();
    expect(usersStub.updateProfile).toHaveBeenCalledWith({ fullName: 'New Name', heightCm: 182 });
  });

  it('rejects out-of-range height without calling the API', () => {
    const fixture = TestBed.createComponent(EditProfileComponent);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.heightCm.set('10');
    cmp.save();
    expect(usersStub.updateProfile).not.toHaveBeenCalled();
    expect(cmp.error()).toContain('altura');
  });
});
