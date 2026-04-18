import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDoctorFirstComponent } from './add-doctor-first.component';

describe('AddDoctorFirstComponent', () => {
  let component: AddDoctorFirstComponent;
  let fixture: ComponentFixture<AddDoctorFirstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDoctorFirstComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDoctorFirstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
