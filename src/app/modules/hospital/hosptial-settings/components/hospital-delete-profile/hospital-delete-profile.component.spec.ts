import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalDeleteProfileComponent } from './hospital-delete-profile.component';

describe('HospitalDeleteProfileComponent', () => {
  let component: HospitalDeleteProfileComponent;
  let fixture: ComponentFixture<HospitalDeleteProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HospitalDeleteProfileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalDeleteProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
