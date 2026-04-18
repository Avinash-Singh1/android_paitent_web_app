import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDoctorSecondComponent } from './add-doctor-second.component';

describe('AddDoctorSecondComponent', () => {
  let component: AddDoctorSecondComponent;
  let fixture: ComponentFixture<AddDoctorSecondComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDoctorSecondComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDoctorSecondComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
